import { useEffect, useRef } from 'react';

interface IntroCanvasProps {
  loading: boolean;
  onComplete: () => void;
}

const IntroCanvas: React.FC<IntroCanvasProps> = ({ loading, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!loading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;
    let animationFrameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isActive = true;
    let particles: Particle[] = [];
    
    // 获取设备物理像素比，防止高清屏变糊或锯齿
    const dpr = window.devicePixelRatio || 1;

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });

    const resizeCanvas = () => {
      // 画布内部真实分辨率放大
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      // CSS 样式控制显示大小
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // 等比放大绘图上下文，之后所有的绘制依然可以直接使用逻辑像素
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    class Particle {
      originX: number;
      originY: number;
      x: number;
      y: number;
      baseSize: number;
      size: number;
      baseAlpha: number;
      vx: number;
      vy: number;
      vz: number;
      z: number;
      isScattered: boolean;
      ease: number;
      wind: number;

      constructor(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(window.innerWidth, window.innerHeight) * (Math.random() * 0.5 + 0.5);
        this.x = window.innerWidth / 2 + Math.cos(angle) * radius;
        this.y = window.innerHeight / 2 + Math.sin(angle) * radius;
        this.baseSize = Math.random() * 1.5 + 0.5;
        this.size = this.baseSize;
        this.baseAlpha = Math.random() * 0.6 + 0.4;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.z = 1;
        this.isScattered = false;
        this.ease = Math.random() * 0.04 + 0.015;
        this.wind = 0;
      }

      gather() {
        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
      }

      hold() {
        if (this.isScattered) {
          this.scatter();
          return;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 60;

        if (distance < maxDist) {
          this.isScattered = true;
          this.initScatter();
          this.vx += (dx / distance) * -3;
          this.vy += (dy / distance) * -3;
        } else {
          this.x += (this.originX - this.x) * this.ease + (Math.random() - 0.5) * 0.5;
          this.y += (this.originY - this.y) * this.ease + (Math.random() - 0.5) * 0.5;
        }
      }

      initScatter() {
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * -2 - 0.5;
        this.wind = Math.random() * 0.08 + 0.02;
        if (Math.random() > 0.5) this.wind *= -1;
        this.vz = (Math.random() - 0.5) * 0.03;
      }

      scatter() {
        this.vx += this.wind;
        this.vy -= 0.02;
        this.z += this.vz;
        this.x += this.vx * this.z;
        this.y += this.vy * this.z;
        this.baseSize *= 0.97;
        this.size = Math.max(0, this.baseSize * this.z);
      }

      draw(ctx: CanvasRenderingContext2D) {
        let currentAlpha = this.baseAlpha;
        if (this.z < 1) {
          currentAlpha *= Math.max(0, this.z);
        } else {
          currentAlpha = Math.min(1, currentAlpha * this.z);
        }
        ctx.fillStyle = `rgba(232, 232, 225, ${currentAlpha})`;
        // 小于 2 像素的粒子用 fillRect 绘制性能提升 10 倍以上且视觉无差异
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
      }
    }

    const initParticles = () => {
      particles = [];
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const text = "欢迎参观";
      const fontSize = Math.min(window.innerWidth / 6, 120);
      ctx.font = `bold ${fontSize}px "Songti SC", "Noto Serif SC", serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(text, window.innerWidth / 2, window.innerHeight / 2);

      // getImageData 获取的是真实物理像素
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const step = window.innerWidth > 768 ? Math.floor(4 * dpr) : Math.floor(3 * dpr);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          const alpha = imgData.data[index + 3];
          if (alpha > 128) {
            // 将物理像素坐标转换回逻辑坐标(CSS像素)
            particles.push(new Particle(x / dpr, y / dpr));
          }
        }
      }
    };

    let startTime = Date.now();
    let phase = 'gathering';
    let scatterStartTime = 0;

    const animate = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = Date.now() - startTime;

      if (elapsed > 2200 && phase === 'gathering') {
        phase = 'holding';
      }

      if (phase === 'holding') {
        if (elapsed > 3500) {
          ctx.font = '12px "Courier New", Courier, monospace';
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(elapsed / 300) * 0.5 + 0.5})`;
          ctx.textAlign = "center";
          ctx.fillText("SWIPE TO UNLOCK", window.innerWidth / 2, window.innerHeight / 2 + 100);
        }

        let scatteredCount = 0;
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].isScattered) scatteredCount++;
        }

        if (scatteredCount > particles.length * 0.2) {
          phase = 'scattering';
          scatterStartTime = Date.now();
          particles.forEach(p => {
            if (!p.isScattered) {
              p.isScattered = true;
              p.initScatter();
            }
          });
        }
      } else if (phase === 'scattering') {
        if (Date.now() - scatterStartTime > 2500) {
          phase = 'done';
          sessionStorage.setItem('hasSeenIntro', 'true');
          onComplete();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (phase === 'gathering') p.gather();
        else if (phase === 'holding') p.hold();
        else if (phase === 'scattering') p.scatter();

        if (p.size > 0.1) p.draw(ctx);
      }

      if (phase !== 'done') {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    timeoutId = setTimeout(() => {
      if (!isActive) return;
      initParticles();
      animate();
    }, 100);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading, onComplete]);

  return (
    <div className={`fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 overflow-hidden loading-container ${loading ? '' : 'loading-hidden'}`}>
      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-0 mix-blend-overlay z-10" style={{ animation: 'scratch 2s infinite' }}></div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20"
      />
      <div className="absolute bottom-12 font-mono-data text-[10px] tracking-[0.4em] text-[#444] z-30">
        SYSTEM BOOT SEQUENCE // STANDBY
      </div>
    </div>
  );
};

export default IntroCanvas;
