import { useEffect, useRef } from 'react';

export default function TopoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let animationFrameId: number;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Determine if dark mode is active by checking the document class
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                         document.body.classList.contains('dark-mode');
      
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;

      t += 0.005;
      const step = 40;
      for (let y = -20; y < canvas.height + 20; y += step) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
          const noise = Math.sin(x * 0.005 + t) * Math.cos(y * 0.005 + t) * 15;
          if (x === 0) ctx.moveTo(x, y + noise);
          else ctx.lineTo(x, y + noise);
        }
        ctx.stroke();
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="bg-topo fixed inset-0 z-0 pointer-events-none"></div>
      <canvas 
        ref={canvasRef} 
        id="topo-canvas" 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
      />
    </>
  );
}
