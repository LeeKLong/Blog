import { useEffect, useRef } from 'react';
import '../styles/aplayer.css';

export default function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const aplayerInstance = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fetch playlist from Meting API directly (QQ Music)
    fetch('https://api.i-meto.com/meting/api?server=tencent&type=playlist&id=3148556956')
      .then(res => res.json())
      .then(audio => {
        // @ts-ignore
        if (window.APlayer && !aplayerInstance.current) {
          // @ts-ignore
          aplayerInstance.current = new window.APlayer({
            container: containerRef.current,
            fixed: true,
            mini: true,
            theme: '#e5fe00',
            autoplay: false,
            loop: 'all',
            order: 'list',
            preload: 'auto',
            volume: 0.6,
            listFolded: true,
            listMaxHeight: '260px',
            lrcType: 0,
            audio: audio
          });
        }
      })
      .catch((err) => {
        console.error("Meting API Error:", err);
        // Fallback to render the player UI even if network fails
        // @ts-ignore
        if (window.APlayer && !aplayerInstance.current) {
          // @ts-ignore
          aplayerInstance.current = new window.APlayer({
            container: containerRef.current,
            fixed: true,
            autoplay: false,
            audio: [{
              name: '音乐接口超时 (Network Error)',
              artist: '系统提示',
              url: '',
              cover: '/LEEKLONG.svg'
            }]
          });
        }
      });

    // Idle collapse logic
    const IDLE_MS = 3000;
    const REGION = 130;
    let lastX = -1, lastY = -1;
    let idleTimer: any = null;

    const checkAplayer = setInterval(() => {
      const playerEl = document.querySelector('.aplayer.aplayer-fixed');
      if (!playerEl) return;
      
      const switcher = playerEl.querySelector('.aplayer-miniswitcher');
      if (!switcher) return;

      clearInterval(checkAplayer);
      
      playerEl.classList.add('hide-cover');

      const isNarrow = () => playerEl.classList.contains('aplayer-narrow');
      const inRegion = (x: number, y: number) => x >= 0 && x < REGION && y > window.innerHeight - REGION;

      const hideCover = () => {
        if (!isNarrow()) return; // 全展开状态不自动收起
        if (inRegion(lastX, lastY)) return; // 光标停在左下角时保持展开
        if (!playerEl.classList.contains('hide-cover')) {
          playerEl.classList.add('hide-cover');
        }
      };

      const armIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(hideCover, IDLE_MS);
      };

      const handleSwitcherClick = (e: Event) => {
        if (playerEl.classList.contains('hide-cover')) {
          // 第一次点击：只显示封面
          playerEl.classList.remove('hide-cover');
          e.stopPropagation();
          armIdle();
        } else if (!isNarrow()) {
          // 从全展开状态收起时，直接回到完全收起状态
          playerEl.classList.add('hide-cover');
        }
      };

      switcher.addEventListener('click', handleSwitcherClick, true);

      const handleMouseMove = (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        armIdle();
      };
      
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      armIdle();
    }, 500);

    return () => {
      clearInterval(checkAplayer);
      clearTimeout(idleTimer);
      if (aplayerInstance.current) {
        aplayerInstance.current.destroy();
      }
    };
  }, []);

  return <div ref={containerRef}></div>;
}
