import { useRef, useEffect, useState } from 'react';
import { useOS, type WindowState } from '../context/OSContext';
import gsap from 'gsap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { sfx } from '../../../utils/sound';

export default function Window({ winState }: { winState: WindowState }) {
  const { dispatch } = useOS();
  const winRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const currentSnapRef = useRef<'left' | 'right' | 'top' | null>(null);
  const [snapped, setSnapped] = useState<'left' | 'right' | 'top' | null>(null);
  
  const { id, project, isAbout, minimized, maximized, focused, zIndex, spawnIndex = 1 } = winState;

  useEffect(() => {
    // Entrance Animation
    if (winRef.current) {
      gsap.fromTo(
        winRef.current,
        { opacity: 0, scale: 0.9, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }
  }, []); // Run only on mount

  // Basic draggable implementation
  useEffect(() => {
    const el = winRef.current;
    if (!el) return;

    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Ensure we're dragging from the titlebar and not from a button
      if (!(e.target as HTMLElement).closest('.win-titlebar')) return;
      if ((e.target as HTMLElement).closest('.win-btn')) return;
      
      dispatch({ type: 'FOCUS_WINDOW', payload: id });

      if (maximized) return; // Don't drag if maximized
      
      setSnapped(null); // Clear snapped state on drag start

      isDraggingRef.current = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = el.offsetLeft;
      initialTop = el.offsetTop;
      
      el.style.transition = 'none'; // Disable transition during drag
      gsap.to(el, { scale: 1.02, duration: 0.15, ease: 'power2.out' });
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      el.style.left = `${initialLeft + dx}px`;
      el.style.top = `${initialTop + dy}px`;

      // Snap logic
      const snapGuide = document.getElementById('snap-guide');
      const snapLeft = document.getElementById('snap-guide-left');
      const snapRight = document.getElementById('snap-guide-right');
      const snapTop = document.getElementById('snap-guide-top');

      if (snapGuide && snapLeft && snapRight && snapTop) {
        snapGuide.classList.remove('hidden');
        snapLeft.classList.add('hidden');
        snapRight.classList.add('hidden');
        snapTop.classList.add('hidden');

        if (e.clientX < 20) {
          snapLeft.classList.remove('hidden');
          currentSnapRef.current = 'left';
        } else if (e.clientX > window.innerWidth - 20) {
          snapRight.classList.remove('hidden');
          currentSnapRef.current = 'right';
        } else if (e.clientY < 20) {
          snapTop.classList.remove('hidden');
          currentSnapRef.current = 'top';
        } else {
          snapGuide.classList.add('hidden');
          currentSnapRef.current = null;
        }
      }
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      
      const snapGuide = document.getElementById('snap-guide');
      if (snapGuide) snapGuide.classList.add('hidden');

      if (currentSnapRef.current) {
        if (currentSnapRef.current === 'top') {
          dispatch({ type: 'TOGGLE_MAXIMIZE', payload: id });
        } else {
          setSnapped(currentSnapRef.current);
        }
        currentSnapRef.current = null;
      }

      el.style.transition = 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      gsap.to(el, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
  }, [id, dispatch, maximized]);

  if (minimized) {
    // If minimized, we can either hide it or let CSS/GSAP handle it. 
    // Here we'll just hide it from React rendering to keep DOM clean if we want, 
    // or keep it mounted but visually hidden.
    return <div ref={winRef} style={{ display: 'none' }} />;
  }

  const offsetPx = ((spawnIndex - 1) % 10) * 32;
  const defaultWidth = isAbout ? 400 : 560;
  const defaultHeight = isAbout ? 280 : 380;
  const initialLeft = isAbout ? `calc(100% - 420px - ${offsetPx}px)` : `calc(10% + ${offsetPx}px)`;
  const initialTop = isAbout ? `calc(20px + ${offsetPx}px)` : `calc(10% + ${offsetPx}px)`;
  
  let left: string | number = initialLeft;
  let top: string | number = initialTop;
  let width: string | number = defaultWidth;
  let height: string | number = defaultHeight;

  if (maximized) {
    left = 0;
    top = 0;
    width = '100%';
    height = '100%';
  } else if (snapped === 'left') {
    left = 0;
    top = 0;
    width = '50%';
    height = '100%';
  } else if (snapped === 'right') {
    left = '50%';
    top = 0;
    width = '50%';
    height = '100%';
  }

  const winStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    zIndex: zIndex,
    pointerEvents: 'auto',
    transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const handleClose = () => {
    sfx.playBeep(850, 0.04);
    gsap.to(winRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => dispatch({ type: 'CLOSE_WINDOW', payload: id })
    });
  };

  return (
    <div
      ref={winRef}
      className={`os-win flex flex-col bg-white border-2 border-endfield-dark shadow-2xl overflow-hidden font-sans ${
        focused ? 'shadow-[0_16px_48px_rgba(0,0,0,0.25)] border-endfield-yellow' : 'opacity-95'
      }`}
      style={winStyle}
      onClick={() => dispatch({ type: 'FOCUS_WINDOW', payload: id })}
    >
      {/* Title Bar */}
      <div className={`win-titlebar h-9 flex items-center justify-between px-2 cursor-move ${
        focused ? 'topo-accent-bg text-endfield-dark border-b-2 border-endfield-dark' : 'bg-endfield-bg text-endfield-muted border-b border-endfield-border'
      }`}>
        <div className="flex items-center gap-2 font-tech font-bold text-xs">
          <i className={`fa-solid ${project?.icon || 'fa-folder'}`}></i>
          <span className="tracking-widest">{project?.title || 'System Window'}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isAbout && (
            <>
              <button 
                className="win-btn w-6 h-6 flex items-center justify-center hover:bg-black/10 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', payload: id }); }}
              >
                <i className="fa-solid fa-minus text-[10px]"></i>
              </button>
              <button 
                className="win-btn w-6 h-6 flex items-center justify-center hover:bg-black/10 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_MAXIMIZE', payload: id }); }}
              >
                <i className={`fa-solid ${maximized ? 'fa-compress' : 'fa-expand'} text-[10px]`}></i>
              </button>
            </>
          )}
          <button 
            className="win-btn win-close w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
          >
            <i className="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-endfield-panel p-4 flex flex-col relative">
        <div className="text-[10px] font-tech text-endfield-yellow tracking-widest uppercase mb-2">
          [{project?.sector || 'SYS'}] {project?.status}
        </div>
        <h2 className="text-xl font-black font-title text-endfield-dark dark:text-white mb-4">{project?.title}</h2>
        <div className="flex-1 text-sm text-endfield-text dark:text-neutral-200 leading-relaxed font-sans overflow-auto prose prose-sm dark:prose-invert max-w-none">
          {isAbout ? (
            <div className="whitespace-pre-wrap text-endfield-text dark:text-neutral-200">{project?.full}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {project?.full || ''}
            </ReactMarkdown>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-endfield-border flex justify-between items-center text-xs font-tech text-endfield-muted">
          <span>TECH: {project?.tech}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow"></span> ONLINE
          </span>
        </div>
      </div>
      {/* Resize Handle */}
      {!maximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
          onMouseDown={(e) => {
            e.stopPropagation();
            const el = winRef.current;
            if (!el) return;
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = el.offsetWidth;
            const startHeight = el.offsetHeight;
            el.style.transition = 'none';
            document.body.style.userSelect = 'none';

            const onMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = Math.max(300, startWidth + moveEvent.clientX - startX);
              const newHeight = Math.max(200, startHeight + moveEvent.clientY - startY);
              el.style.width = `${newWidth}px`;
              el.style.height = `${newHeight}px`;
            };

            const onMouseUp = () => {
              document.body.style.userSelect = '';
              el.style.transition = 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-endfield-muted/50 group-hover:border-endfield-dark"></div>
        </div>
      )}
    </div>
  );
}
