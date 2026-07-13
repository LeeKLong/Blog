import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/posts';
import WavyLines from '../components/WavyLines';
import IntroCanvas from '../components/IntroCanvas';
import { Shader, Swirl, ChromaFlow, FlutedGlass } from 'shaders/react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const isFirstLoad = useRef(!sessionStorage.getItem('hasSeenIntro')).current;
  const [loading, setLoading] = useState(isFirstLoad);
  
  const [activeChannel, setActiveChannelState] = useState(() => sessionStorage.getItem('activeChannel') || 'ALL SCENES');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const setActiveChannel = (channel: string) => {
    setActiveChannelState(channel);
    sessionStorage.setItem('activeChannel', channel);
  };

  // 混合类型文章数据
  const rawPosts = getAllPosts();

  const processedPosts = rawPosts.map(post => {
    let imageUrl = post.attributes.image;
    let hasCustomImage = true;

    // 匹配 Markdown 格式图片: ![alt](url)
    const imgMatch = post.body.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    } else if (!imageUrl) {
      imageUrl = '';
      hasCustomImage = false;
    }

    return {
      id: post.attributes.id,
      date: post.attributes.date,
      type: post.attributes.type,
      title: post.attributes.title,
      subtitle: post.attributes.subtitle,
      excerpt: post.attributes.excerpt,
      status: post.attributes.status,
      url: post.attributes.url || `/post/${post.attributes.id}`,
      imageUrl,
      hasCustomImage
    };
  });

  const channels = ['ALL SCENES', 'PROJECTS', 'AI_LAB', 'LIFE_LOG'];

  const introItem = { isIntro: true, id: 'intro', type: 'INTRO' };
  
  const displayItems = activeChannel === 'ALL SCENES'
    ? [introItem, ...processedPosts]
    : processedPosts.filter(post => post.type === activeChannel);

  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const lastWheelTime = useRef<number>(0);
  
  // Touch Event Refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeChannel]);

  const handleWheel = (e: React.WheelEvent) => {
    if (displayItems.length <= 1) return;
    const now = Date.now();
    if (now - lastWheelTime.current < 600) return; // 600ms 防抖

    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0) {
        setSlideDirection('right');
        setActiveIndex(prev => (prev + 1) % displayItems.length);
      } else {
        setSlideDirection('left');
        setActiveIndex(prev => (prev - 1 + displayItems.length) % displayItems.length);
      }
      lastWheelTime.current = now;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // 如果横向滑动距离大于纵向，并且横向滑动超过 50px，则认为是有效滑动
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        setSlideDirection('right');
        setActiveIndex(prev => (prev + 1) % displayItems.length);
      } else {
        setSlideDirection('left');
        setActiveIndex(prev => (prev - 1 + displayItems.length) % displayItems.length);
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayItems.length <= 1) return;
      const now = Date.now();
      if (now - lastWheelTime.current < 600) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSlideDirection('right');
        setActiveIndex(prev => (prev + 1) % displayItems.length);
        lastWheelTime.current = now;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSlideDirection('left');
        setActiveIndex(prev => (prev - 1 + displayItems.length) % displayItems.length);
        lastWheelTime.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayItems.length]);

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? 200 : -200,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? -200 : 200,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const fadeClass = !isFirstLoad 
    ? 'opacity-0 animate-fade-in' 
    : (loading ? 'opacity-0' : 'opacity-0 animate-fade-in-up');

  const currentItem = displayItems[activeIndex] as any;

  return (
    <div 
      className="relative h-[100dvh] w-full bg-[#0A0A0A] text-[#D1D1C7] font-sans selection:bg-[#E8E8E1] selection:text-[#0A0A0A] overflow-hidden flex flex-col"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= 粒子 Loading 界面 ================= */}
      <IntroCanvas loading={loading} onComplete={() => setLoading(false)} />
      {/* ======================================================= */}

      {/* Background Shader */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen [&>div]:!w-full [&>div]:!h-full [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover">
        {!loading && (
          <Shader>
            <Swirl colorA="#111111" colorB="#050505" detail={1.7} />
            <ChromaFlow baseColor="#0a0a0a" downColor="#222222" leftColor="#151515" rightColor="#1a1a1a" upColor="#2a2a2a" momentum={13} radius={3.5} />
            <FlutedGlass aberration={0.3} angle={31} frequency={8} highlight={0.05} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.1} />
          </Shader>
        )}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,2,2,0.95)_100%)] z-[1] pointer-events-none"></div>

      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 h-12 md:h-16 bg-transparent z-[110] border-b border-[#111] px-6 md:px-10 flex justify-between items-center ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.4s' : '0s' }}>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <h1 onClick={() => setIsNavOpen(!isNavOpen)} className="font-serif-display text-sm md:text-lg text-[#E8E8E1] hover-flicker cursor-pointer tracking-widest leading-none flex items-center gap-2">
            LEEKLONG
            <span className={`md:hidden text-[8px] transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`}>▼</span>
          </h1>
          <span className="font-mono-data text-[8px] md:text-[10px] tracking-[0.3em] text-[#666] hidden sm:block leading-none pt-0.5">
            PERSONAL ARCHIVE
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-end flex-1 space-x-5 md:space-x-8 font-mono-data text-[9px] md:text-[11px] tracking-widest uppercase text-[#555] ml-4 mask-image-fade">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`transition-colors duration-300 whitespace-nowrap h-10 md:h-12 px-1 flex items-center ${activeChannel === channel ? 'text-[#E8E8E1]' : 'hover:text-[#888]'}`}
            >
              CH:{channel}
            </button>
          ))}
        </div>
        
        {/* Mobile Active Channel Indicator */}
        <div className="md:hidden flex-1 flex justify-end font-mono-data text-[10px] tracking-widest uppercase text-[#E8E8E1] opacity-70">
          CH:{activeChannel}
        </div>
      </header>

      {/* Mobile Dropdown Nav */}
      <div className={`absolute top-12 left-0 right-0 bg-[#050505]/90 backdrop-blur-md border-b border-[#111] z-[105] transition-all duration-300 overflow-hidden md:hidden flex flex-col px-6 font-mono-data text-[11px] tracking-widest uppercase text-[#555] ${isNavOpen ? 'py-4 max-h-64 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col space-y-4 py-2">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => {
                setActiveChannel(channel);
                setIsNavOpen(false);
              }}
              className={`transition-colors text-left ${activeChannel === channel ? 'text-[#E8E8E1] border-l-2 border-[#E8E8E1] pl-2' : 'hover:text-[#888] pl-2'}`}
            >
              CH:{channel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slider Content */}
      <main className={`flex-1 w-full relative z-[20] flex items-center justify-center pt-16 pb-16 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.8s' : '0s' }}>
        <AnimatePresence custom={slideDirection} mode="wait">
          {displayItems.length > 0 && (
            <motion.div
              key={currentItem.id}
              custom={slideDirection}
              variants={slideVariants as any}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-x-0 inset-y-16 md:inset-y-24 px-6 md:px-16 flex items-center justify-center"
            >
              {currentItem.isIntro ? (
                /* === 第一张卡片：个人介绍 === */
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 relative h-full max-h-[70vh] items-center">
                  <div className="absolute inset-0 z-[-1] opacity-50 mix-blend-screen pointer-events-none -m-12">
                    <WavyLines interactive={false} />
                  </div>
                  {/* 左侧：巨型标识与控制台宣言 */}
                  <div className="lg:col-span-7 flex flex-col justify-center gap-8 md:gap-12 relative z-10">
                    <div>
                      <h3 className="font-mono-data text-[#555] text-[11px] tracking-widest mb-6 border-l-2 border-[#E8E8E1] pl-3">
                        SYS.IDENT // OVERRIDE
                      </h3>
                      <h1 className="font-serif-display text-5xl md:text-7xl lg:text-[6rem] text-[#E8E8E1] tracking-tighter leading-[0.9] uppercase mix-blend-difference">
                        DIGITAL<br />CRAFTSMAN.
                      </h1>
                    </div>

                    <div className="relative pl-6 border-l border-dashed border-[#333] mt-2">
                      <div className="absolute top-0 left-[-4px] w-2 h-2 bg-[#E8E8E1]" style={{ animation: 'flicker 3s infinite' }}></div>
                      <div className="font-mono-data text-[#888] text-[12px] md:text-sm leading-relaxed max-w-xl space-y-4">
                        <p className="text-[#aaa]">&gt; INITIALIZING CORE PROTOCOLS...</p>
                        <p className="text-[#aaa]">&gt; STATUS: <span className="text-[#E8E8E1]">ONLINE</span></p>
                        <p className="pt-2">
                          大学牲一枚。热爱看番、音乐、交互设计，以及 旮旯干木。<br />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：HUD 数据化面板 */}
                  <div className="lg:col-span-5 flex flex-col justify-center gap-8 md:gap-12 z-10 hidden md:flex">
                    {/* 技能矩阵 */}
                    <div>
                      <h3 className="font-mono-data text-[#555] text-[11px] tracking-[0.3em] mb-5">
                        [ MODULES_LOADED ]
                      </h3>
                      <div className="flex flex-col gap-2">
                        {['REACT // DOM_ENGINE', 'TAILWIND // STYLING', 'TYPESCRIPT // LOGIC', 'CANVAS // FX_RENDER'].map((skill) => (
                          <div key={skill} className="group relative border border-[#222] bg-[#050505]/50 backdrop-blur-sm p-3 hover:border-[#555] transition-colors cursor-default overflow-hidden">
                            <div className="absolute inset-0 bg-[#E8E8E1] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></div>
                            <span className="relative z-10 font-mono-data text-[11px] tracking-widest text-[#888] group-hover:text-[#050505] transition-colors duration-500">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 核心指令 */}
                    <div>
                      <h3 className="font-mono-data text-[#555] text-[11px] tracking-[0.3em] mb-5">
                        [ CURRENT_DIRECTIVES ]
                      </h3>
                      <ul className="space-y-6">
                        <li className="flex items-start gap-4 group">
                          <span className="text-[#E8E8E1] font-mono-data text-sm mt-0.5">01</span>
                          <p className="font-serif-display text-[#888] group-hover:text-[#ccc] transition-colors text-base md:text-lg leading-snug">
                            Exploring boundaries of physical interactions.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* === 第二+张卡片：文章卡 === */
                <article className="w-full max-w-6xl h-full max-h-[70vh] flex flex-col md:flex-row items-stretch bg-[#050505]/80 backdrop-blur-md border border-[#1a1a1a] group relative shadow-2xl">
                  {/* Full Card Link Overlay */}
                  {currentItem.url.startsWith('http') ? (
                    <a href={currentItem.url} target="_blank" rel="noreferrer" className="absolute inset-0 z-20">
                      <span className="sr-only">Go to {currentItem.title}</span>
                    </a>
                  ) : (
                    <Link to={currentItem.url} className="absolute inset-0 z-20">
                      <span className="sr-only">Go to {currentItem.title}</span>
                    </Link>
                  )}

                  {/* Left: Image (Hero Style) */}
                  <div className="w-full h-48 md:h-auto md:w-1/2 relative overflow-hidden border-b md:border-b-0 md:border-r border-[#1a1a1a] shrink-0">
                    <div className="absolute inset-0 border border-[#111] group-hover:border-[#444] z-20 transition-colors duration-700 pointer-events-none"></div>
                    <div className="absolute left-0 right-0 h-32 bg-noise mix-blend-overlay z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-scanline"></div>
                    <div className="absolute left-0 right-0 h-[1px] bg-white/40 z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-flicker"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-0 mix-blend-overlay z-30 pointer-events-none fx-scratch"></div>

                    {currentItem.hasCustomImage ? (
                      <img
                        src={currentItem.imageUrl}
                        alt={currentItem.title}
                        className={`w-full h-full object-cover opacity-60 transition-all duration-[2s] ease-out
                          ${currentItem.type === 'LIFE_LOG' ? 'grayscale contrast-125 group-hover:grayscale-0' : 'sepia-[.8] hue-rotate-[180deg] saturate-50 group-hover:saturate-100'} 
                          group-hover:opacity-100 group-hover:scale-[1.05]`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center p-8 text-center bg-[#080808] opacity-80 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-[2s] ease-out relative">
                        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                        <h4 className="font-serif-display text-3xl md:text-4xl text-[#E8E8E1] mb-4 z-10">{currentItem.title}</h4>
                        <div className="w-12 h-[1px] bg-[#555] my-4 z-10"></div>
                        <p className="font-mono-data text-[10px] md:text-[12px] text-[#888] tracking-widest uppercase z-10">{currentItem.subtitle}</p>
                      </div>
                    )}
                    
                    <div className="absolute top-6 left-6 z-40 font-mono-data text-[10px] md:text-[11px] tracking-widest bg-black/90 text-[#E8E8E1] px-4 py-2 border border-[#333] backdrop-blur-sm">
                      {currentItem.type}
                    </div>
                  </div>

                  {/* Right: Content details */}
                  <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 relative z-10 bg-[#050505]/60 overflow-y-auto">
                    <div className="font-mono-data text-[10px] md:text-[11px] tracking-[0.2em] text-[#555] mb-4 md:mb-6 flex items-center justify-between">
                      <span>ID: {currentItem.id}</span>
                      <span className={`flex items-center gap-2 ${currentItem.status === 'ONLINE' ? 'text-[#a3c2a4]' : (currentItem.status === 'EXPERIMENTAL' ? 'text-[#c2a381]' : 'text-[#666]')}`}>
                        <span className={`w-2 h-2 rounded-full ${currentItem.status === 'ONLINE' ? 'bg-[#a3c2a4]' : (currentItem.status === 'EXPERIMENTAL' ? 'bg-[#c2a381]' : 'bg-[#666]')} animate-pulse`}></span>
                        {currentItem.status}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-2xl md:text-4xl text-[#C4C4BA] mb-4 group-hover:text-[#E8E8E1] transition-colors duration-700 tracking-wide line-clamp-2 leading-tight">
                      {currentItem.title}
                    </h3>

                    <div className="font-mono-data text-[10px] md:text-[12px] tracking-[0.2em] text-[#666] mb-8 uppercase">
                      {currentItem.subtitle}
                    </div>

                    <p className="font-serif-display text-sm md:text-base text-[#777] leading-relaxed mb-8 opacity-90 text-justify line-clamp-4 md:line-clamp-6 flex-grow">
                      {currentItem.excerpt}
                    </p>

                    <div className="flex items-center justify-between font-mono-data text-[11px] tracking-[0.2em] mt-auto pt-6 border-t border-[#1a1a1a] relative z-30 pointer-events-auto">
                      <span className="text-[#444]">{currentItem.date}</span>
                      {currentItem.url.startsWith('http') ? (
                        <a href={currentItem.url} target="_blank" rel="noreferrer" className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-3 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-6 h-[1px] bg-[#555] group-hover/btn:w-12 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </a>
                      ) : (
                        <Link to={currentItem.url} className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-3 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-6 h-[1px] bg-[#555] group-hover/btn:w-12 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Pagination Indicator */}
      <div className={`absolute bottom-16 md:bottom-20 right-6 md:right-12 z-[110] font-mono-data text-[11px] tracking-widest text-[#555] flex items-center gap-4 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '1.2s' : '0s' }}>
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
        <div className="w-20 md:w-32 h-[1px] bg-[#222] relative overflow-hidden">
           <motion.div 
             className="absolute top-0 left-0 h-full bg-[#E8E8E1]"
             initial={{ width: 0 }}
             animate={{ width: `${((activeIndex + 1) / Math.max(1, displayItems.length)) * 100}%` }}
             transition={{ duration: 0.5, ease: 'easeOut' }}
           />
        </div>
        <span>{String(displayItems.length).padStart(2, '0')}</span>
      </div>

      {/* Footer / Rec Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 md:h-12 bg-[#000] z-[110] border-t border-[#111] flex justify-between items-center px-6 md:px-10">
        <span className="font-mono-data text-[9px] md:text-[10px] text-[#444] tracking-[0.3em] block" style={{ animation: 'flicker 4s infinite' }}>REC ◉ 24 FPS</span>
        <span className="font-mono-data text-[9px] md:text-[10px] text-[#444] tracking-[0.3em] block">MASTER DIR // HYBRID ARCHIVE</span>
      </div>
    </div>
  );
};

export default Home;
