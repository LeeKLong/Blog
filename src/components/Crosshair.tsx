import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Crosshair() {
  const coordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Basic styling updates for custom cursor
      gsap.to('#crosshair-cursor', { opacity: 1, duration: 0.2 });
      
      gsap.to('#crosshair-x', {
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
      gsap.to('#crosshair-y', {
        x: e.clientX,
        duration: 0.1,
        ease: "power2.out"
      });
      gsap.to('#crosshair-center', {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
      });

      if (coordsRef.current) {
        coordsRef.current.textContent = `X:${Math.round(e.clientX)} Y:${Math.round(e.clientY)}`;
      }
    };

    const handleMouseLeave = () => {
      gsap.to('#crosshair-cursor', { opacity: 0, duration: 0.2 });
    };

    const handleMouseDown = () => {
      gsap.to('#crosshair-reticle', { scale: 0.7, borderColor: '#e5fe00', duration: 0.1 });
    };

    const handleMouseUp = () => {
      gsap.to('#crosshair-reticle', { scale: 1, borderColor: '', duration: 0.15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div id="crosshair-cursor" className="fixed inset-0 pointer-events-none hidden md:block overflow-hidden opacity-0" style={{ zIndex: 2147483647 }}>
      <div id="crosshair-x" className="absolute left-0 right-0 h-[1px] bg-endfield-dark/30 dark:bg-white/30 top-0 will-change-transform pointer-events-none"></div>
      <div id="crosshair-y" className="absolute top-0 bottom-0 w-[1px] bg-endfield-dark/30 dark:bg-white/30 left-0 will-change-transform pointer-events-none"></div>
      <div id="crosshair-center" className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform pointer-events-none">
        <div id="crosshair-reticle" className="w-3.5 h-3.5 border border-endfield-dark/70 dark:border-endfield-yellow/80 relative flex items-center justify-center">
          <div className="w-1 h-1 bg-endfield-yellow"></div>
        </div>
        <div ref={coordsRef} id="cursor-coords" className="absolute left-4 top-1 text-[9px] font-mono text-endfield-dark dark:text-endfield-yellow bg-white/80 dark:bg-black/80 px-1 py-0.5 border border-endfield-border dark:border-neutral-700 whitespace-nowrap shadow-sm">
          X:0000 Y:0000
        </div>
      </div>
    </div>
  );
}
