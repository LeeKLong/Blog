import { useEffect, useRef, useId } from 'react';

const MAX_OPACITY = 0.25;
const MIN_OPACITY = 0.02;

const WavyLines = ({ interactive = true, inverted = false }: { interactive?: boolean, inverted?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientRef = useRef<SVGRadialGradientElement>(null);
  const gradientId = `spotlight-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
    const container = containerRef.current;
    const svg = svgRef.current;

    let bounding = container.getBoundingClientRect();
    const mouse = {
      x: bounding.width / 2, y: bounding.height / 2, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0,
    };
    
    type Point = { x: number, y: number, cursor: { x: number, y: number, vx: number, vy: number } };
    let lines: Point[][] = [];
    let paths: SVGPathElement[] = [];
    let animationFrameId: number;
    let lastMoveTime = 0;
    let currentSpotlightOpacity = interactive ? MIN_OPACITY : MAX_OPACITY;

    const setSize = () => {
      bounding = container.getBoundingClientRect();
      svg.style.width = `${bounding.width}px`;
      svg.style.height = `${bounding.height}px`;
    };

    const setLines = () => {
      const { width, height } = bounding;
      lines = [];
      paths.forEach((path) => path.remove());
      paths = [];

      const xGap = 15;
      const yGap = 32;

      const oWidth = width + 200;
      const oHeight = height + 30;

      const totalLines = Math.ceil(oWidth / xGap);
      const totalPoints = Math.ceil(oHeight / yGap);

      const xStart = (width - xGap * totalLines) / 2;
      const yStart = (height - yGap * totalPoints) / 2;

      for (let j = 0; j <= totalPoints; j++) {
        const points: Point[] = [];
        for (let i = 0; i <= totalLines; i++) {
          const point = {
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          };
          points.push(point);
        }
        lines.push(points);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.style.fill = 'none';
        path.style.stroke = `url(#${gradientId})`;
        path.style.strokeWidth = '1px';
        svg.appendChild(path);
        paths.push(path);
      }
    };

    const updateMousePosition = (x: number, y: number) => {
      if (!interactive) return;
      mouse.x = x - bounding.left;
      mouse.y = y - bounding.top;
      lastMoveTime = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => updateMousePosition(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleResize = () => {
      setSize();
      setLines();
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    const movePoints = () => {
      lines.forEach((points) => {
        points.forEach((p) => {
          if (interactive) {
            const dx = p.x - mouse.sx;
            const dy = p.y - mouse.sy;
            const d = Math.hypot(dx, dy);
            const l = Math.max(175, mouse.vs);

            if (d < l) {
              const f = 1 - d / l;
              p.cursor.vx += Math.cos(mouse.a) * f * mouse.vs * 0.02;
              p.cursor.vy += Math.sin(mouse.a) * f * mouse.vs * 0.02;
            }
          }

          p.cursor.vx += (0 - p.cursor.x) * 0.005;
          p.cursor.vy += (0 - p.cursor.y) * 0.005;

          p.cursor.vx *= 0.925;
          p.cursor.vy *= 0.925;

          p.cursor.x += p.cursor.vx * 2;
          p.cursor.y += p.cursor.vy * 2;

          p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x));
          p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
        });
      });
    };

    const moved = (point: any, withCursorForce = true) => {
      const coords = {
        x: point.x + (withCursorForce ? point.cursor.x : 0),
        y: point.y + (withCursorForce ? point.cursor.y : 0),
      };

      coords.x = Math.round(coords.x * 10) / 10;
      coords.y = Math.round(coords.y * 10) / 10;

      return coords;
    };

    const getContourOffset = (x: number, y: number, time: number) => {
      const t = time * 0.0005;
      const wave1 = Math.sin(x * 0.005 + t) * 15;
      const wave2 = Math.sin(x * 0.003 - t * 0.8 + y * 0.005) * 20;
      const wave3 = Math.cos(x * 0.008 + y * 0.008 + t * 0.5) * 10;
      return wave1 + wave2 + wave3;
    };

    const drawLines = (time: number) => {
      lines.forEach((points, lIndex) => {
        let p1 = moved(points[0], false);
        let offsetY1 = getContourOffset(p1.x, p1.y, time);
        let d = `M ${p1.x} ${p1.y + offsetY1}`;

        points.forEach((p, pIndex) => {
          const isLast = pIndex === points.length - 1;
          const coords = moved(p, !isLast);
          let offsetY = getContourOffset(coords.x, coords.y, time);
          d += `L ${coords.x} ${coords.y + offsetY}`;
        });

        if (paths[lIndex]) paths[lIndex].setAttribute('d', d);
      });
    };

    const tick = (time: number) => {
      if (interactive) {
        mouse.sx += (mouse.x - mouse.sx) * 0.1;
        mouse.sy += (mouse.y - mouse.sy) * 0.1;

        const dx = mouse.x - mouse.lx;
        const dy = mouse.y - mouse.ly;
        const d = Math.hypot(dx, dy);

        mouse.v = d;
        mouse.vs += (d - mouse.vs) * 0.1;
        mouse.vs = Math.min(100, mouse.vs);

        mouse.lx = mouse.x;
        mouse.ly = mouse.y;

        mouse.a = Math.atan2(dy, dx);
      }

      movePoints();
      drawLines(time);

      if (gradientRef.current) {
        if (interactive) {
          gradientRef.current.setAttribute('cx', mouse.x.toString());
          gradientRef.current.setAttribute('cy', mouse.y.toString());
          
          const now = Date.now();
          const timeSinceLastMove = now - lastMoveTime;
          let targetOpacity = inverted ? MIN_OPACITY : MAX_OPACITY; 
          if (timeSinceLastMove > 2000 || lastMoveTime === 0) {
            targetOpacity = inverted ? MAX_OPACITY : MIN_OPACITY;
          }

          currentSpotlightOpacity += (targetOpacity - currentSpotlightOpacity) * 0.03;
        } else {
          gradientRef.current.setAttribute('cx', (bounding.width / 2).toString());
          gradientRef.current.setAttribute('cy', (bounding.height / 2).toString());
          currentSpotlightOpacity = MAX_OPACITY;
        }
        
        const stop1 = gradientRef.current.children[0] as SVGStopElement;
        stop1.setAttribute('stop-color', `rgba(255, 255, 255, ${currentSpotlightOpacity})`);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    setSize();
    setLines();
    tick(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      }
      cancelAnimationFrame(animationFrameId);
      paths.forEach((path) => path.remove());
    };
  }, [interactive]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <svg ref={svgRef} className="w-full h-full pointer-events-none">
        <defs>
          <radialGradient ref={gradientRef} id={gradientId} cx="50%" cy="50%" r="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="100%" stopColor={inverted ? `rgba(255, 255, 255, ${MAX_OPACITY})` : `rgba(255, 255, 255, ${MIN_OPACITY})`} />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default WavyLines;
