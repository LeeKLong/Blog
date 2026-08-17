import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sfx } from '../utils/sound';

export default function BootScreen({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bootScreen = document.getElementById('boot-screen');
    const progressBar = document.getElementById('boot-progress-bar');
    if (!bootScreen || !progressBar) return;

    // ~2.8s smooth boot via requestAnimationFrame
    const DURATION = 2800;
    const startTime = performance.now();

    function frame(now: number) {
      const t = Math.min((now - startTime) / DURATION, 1);
      // Ease-out: starts brisk, decelerates near the end
      const eased = 1 - Math.pow(1 - t, 3);
      const progress = eased * 100;

      // Vertical progress on mobile, horizontal on desktop
      if (progressBar) {
        if (window.innerWidth < 640) {
          progressBar.style.height = progress + '%';
          progressBar.style.width = '2px';
        } else {
          progressBar.style.width = progress + '%';
          progressBar.style.height = '2px';
        }
      }

      if (progress < 100) {
        requestAnimationFrame(frame);
        return;
      }

      // Trigger sound effect
      sfx.playBeep(1200, 0.08);

      const isMobileView = window.innerWidth < 640;
      const tl = gsap.timeline({
        onComplete: () => {
          if (bootScreen) bootScreen.style.display = 'none';
          if (onComplete) onComplete();
        }
      });

      // 1. ONLY the progress line and arrow slowly and smoothly fade out
      tl.to('.boot-ui', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });

      // 2. Slicing laser flash & clean dual split along the progress line
      if (isMobileView) {
        // Mobile: Split vertically
        tl.to('#slice-flash-line', {
            opacity: 1,
            duration: 0.15,
            ease: 'power1.in'
        }, '-=0.08')
        .to('#slice-flash-line', {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out'
        }, '+=0.05')
        .to('#boot-slice-1', {
            xPercent: -100,
            duration: 0.75,
            ease: 'power3.inOut'
        }, '<')
        .to('#boot-slice-2', {
            xPercent: 100,
            duration: 0.75,
            ease: 'power3.inOut'
        }, '<');
      } else {
        // Desktop: Split horizontally
        tl.to('#slice-flash-line', {
            opacity: 1,
            duration: 0.15,
            ease: 'power1.in'
        }, '-=0.08')
        .to('#slice-flash-line', {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out'
        }, '+=0.05')
        .to('#boot-slice-1', {
            yPercent: -100,
            duration: 0.75,
            ease: 'power3.inOut'
        }, '<')
        .to('#boot-slice-2', {
            yPercent: 100,
            duration: 0.75,
            ease: 'power3.inOut'
        }, '<');
      }
    }
    
    requestAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div ref={containerRef} id="boot-screen" className="fixed inset-0 z-[10000] select-none font-tech overflow-hidden bg-[var(--boot-bg)]">
      {/* Top / Left Slice */}
      <div id="boot-slice-1" className="boot-slice-1 absolute inset-0 bg-[var(--boot-bg)] pointer-events-none z-10">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-10 sm:grid-cols-10 sm:grid-rows-1">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num, i) => (
            <div key={`s1-${num}`} className="relative">
              {i > 0 && <div className="boot-line absolute sm:hidden inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--boot-line-from)] to-[var(--boot-line-to)]" style={{ animationDelay: `${0.15 + i * 0.15}s` }}></div>}
              {i < 9 && <div className="boot-line absolute hidden sm:block inset-y-0 right-0 w-[2px] bg-gradient-to-b from-[var(--boot-line-from)] to-[var(--boot-line-to)]" style={{ animationDelay: `${0.15 + i * 0.15}s` }}></div>}
              {num < 100 && <span className="boot-num absolute right-2 top-1/2 -translate-y-1/2 sm:top-auto sm:bottom-2 sm:translate-y-0 text-[var(--boot-text)] font-mono text-xs sm:text-sm tracking-wider" style={{ animationDelay: `${0.15 + i * 0.15}s` }}>{num}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom / Right Slice */}
      <div id="boot-slice-2" className="boot-slice-2 absolute inset-0 bg-[var(--boot-bg)] pointer-events-none z-10">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-10 sm:grid-cols-10 sm:grid-rows-1">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num, i) => (
            <div key={`s2-${num}`} className="relative">
              {i > 0 && <div className="boot-line absolute sm:hidden inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--boot-line-from)] to-[var(--boot-line-to)]" style={{ animationDelay: `${0.15 + i * 0.15}s` }}></div>}
              {i < 9 && <div className="boot-line absolute hidden sm:block inset-y-0 right-0 w-[2px] bg-gradient-to-b from-[var(--boot-line-from)] to-[var(--boot-line-to)]" style={{ animationDelay: `${0.15 + i * 0.15}s` }}></div>}
              {num < 100 && <span className="boot-num absolute right-2 top-1/2 -translate-y-1/2 sm:top-auto sm:bottom-2 sm:translate-y-0 text-[var(--boot-text)] font-mono text-xs sm:text-sm tracking-wider" style={{ animationDelay: `${0.15 + i * 0.15}s` }}>{num}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Slicing Laser Flash Line */}
      <div id="slice-flash-line" className="absolute left-[38.2%] top-0 bottom-0 w-[2px] sm:left-0 sm:right-0 sm:top-[72%] sm:bottom-auto sm:w-full sm:h-[2px] bg-endfield-yellow opacity-0 pointer-events-none z-[25] shadow-[0_0_8px_#e5fe00]"></div>

      {/* Progress Line and Arrow */}
      <div className="boot-ui absolute left-[38.2%] top-0 bottom-0 sm:left-0 sm:right-0 sm:top-[72%] sm:bottom-auto z-20 pointer-events-none">
        <div id="loading-line-container" className="relative w-[2px] h-full sm:w-full sm:h-[2px]">
          <div id="boot-progress-bar" className="bg-[var(--boot-accent)] w-[2px] h-0 sm:w-0 sm:h-[2px] relative">
            <div id="loading-arrow" className="absolute bottom-0 left-[-11px] translate-y-1/2 -rotate-90 sm:top-[-13px] sm:bottom-auto sm:left-auto sm:right-0 sm:translate-x-1/2 sm:translate-y-0 sm:rotate-0 text-[var(--boot-accent)] text-[11px] leading-none select-none">▼</div>
          </div>
        </div>
      </div>
    </div>
  );
}
