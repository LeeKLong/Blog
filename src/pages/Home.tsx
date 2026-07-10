import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/posts';
import WavyLines from '../components/WavyLines';
import IntroCanvas from '../components/IntroCanvas';
import { Shader, Swirl, ChromaFlow, FlutedGlass } from 'shaders/react';

const Home = () => {
  const isFirstLoad = useRef(!sessionStorage.getItem('hasSeenIntro')).current;
  const [loading, setLoading] = useState(isFirstLoad);
  
  const headerRef = useRef<HTMLElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Return to home has a quick fade in, first load has the slow scatter animation
  const fadeClass = !isFirstLoad 
    ? 'opacity-0 animate-fade-in' 
    : (loading ? 'opacity-0' : 'opacity-0 animate-fade-in-up');
    
  const [activeChannel, setActiveChannelState] = useState(() => sessionStorage.getItem('activeChannel') || 'ALL SCENES');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const setActiveChannel = (channel: string) => {
    setActiveChannelState(channel);
    sessionStorage.setItem('activeChannel', channel);
  };

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('homeScroll');
    if (savedScroll) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 50); // slight delay to ensure render
    }
    const handleScroll = () => {
      sessionStorage.setItem('homeScroll', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsHeaderVisible(entry.isIntersecting);
    }, { rootMargin: '200px' });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

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

  const filteredPosts = activeChannel === 'ALL SCENES'
    ? processedPosts
    : processedPosts.filter(post => post.type === activeChannel);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#D1D1C7] font-sans selection:bg-[#E8E8E1] selection:text-[#0A0A0A] overflow-x-hidden">

      {/* ================= 粒子 Loading 界面 ================= */}
      <IntroCanvas loading={loading} onComplete={() => setLoading(false)} />
      {/* ======================================================= */}


      {/* ================= 核心视觉：暗角与遮幅 ================= */}
      <div className="fixed inset-0 z-[100] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,2,2,0.95)_100%)]"></div>

      <header className={`fixed top-0 left-0 right-0 h-10 md:h-12 bg-[#000] z-[110] border-b border-[#111] px-4 md:px-8 flex justify-between items-center ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.4s' : '0s' }}>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <h1 onClick={() => setIsNavOpen(!isNavOpen)} className="font-serif-display text-sm md:text-base text-[#E8E8E1] hover-flicker cursor-pointer tracking-widest leading-none flex items-center gap-2">
            LEEKLONG
            <span className={`md:hidden text-[8px] transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`}>▼</span>
          </h1>
          <span className="font-mono-data text-[8px] md:text-[9px] tracking-[0.3em] text-[#666] hidden sm:block leading-none pt-0.5">
            PERSONAL ARCHIVE
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-end flex-1 space-x-5 md:space-x-8 font-mono-data text-[8px] md:text-[9px] tracking-widest uppercase text-[#555] ml-4 mask-image-fade">
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
        <div className="md:hidden flex-1 flex justify-end font-mono-data text-[9px] tracking-widest uppercase text-[#E8E8E1] opacity-70">
          CH:{activeChannel}
        </div>
      </header>

      {/* Mobile Dropdown Nav */}
      <div className={`fixed top-10 left-0 right-0 bg-[#050505] border-b border-[#111] z-[105] transition-all duration-300 overflow-hidden md:hidden flex flex-col px-4 font-mono-data text-[10px] tracking-widest uppercase text-[#555] ${isNavOpen ? 'py-4 max-h-64 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}>
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
      <div className="fixed bottom-0 left-0 right-0 h-10 md:h-12 bg-[#000] z-[110] border-t border-[#111] flex justify-between items-center px-4 md:px-8">
        <span className="font-mono-data text-[8px] md:text-[9px] text-[#444] tracking-[0.3em] block" style={{ animation: 'flicker 4s infinite' }}>REC ◉ 24 FPS</span>
        <span className="font-mono-data text-[8px] md:text-[9px] text-[#444] tracking-[0.3em] block">MASTER DIR // VARIOUS</span>
      </div>


      {/* ================= 主体内容区 ================= */}
      <div className="relative z-10 pb-40 pt-10 md:pt-12">

        <header ref={headerRef} className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-[#050505] flex items-end pb-12">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
            {isHeaderVisible && !loading && (
              <Shader>
                {/* 适配暗色主题的颜色方案 */}
                <Swirl colorA="#111111" colorB="#050505" detail={1.7} />
                <ChromaFlow
                  baseColor="#0a0a0a"
                  downColor="#222222"
                  leftColor="#151515"
                  rightColor="#1a1a1a"
                  upColor="#2a2a2a"
                  momentum={13}
                  radius={3.5}
                />
                <FlutedGlass
                  aberration={0.3}
                  angle={31}
                  frequency={8}
                  highlight={0.05}
                  highlightSoftness={0}
                  lightAngle={-90}
                  refraction={4}
                  shape="rounded"
                  softness={1}
                  speed={0.1}
                />
              </Shader>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10"></div>

          <div className={`relative z-20 px-6 md:px-12 w-full max-w-7xl mx-auto ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.8s' : '0s' }}>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#E8E8E1] leading-[1.1] tracking-tight">
              <span className="italic font-light text-[#888]">ABOUT</span> LEEKLONG.
            </h2>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16 relative">
          <div className="absolute left-6 md:left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#222] to-transparent"></div>

          {activeChannel === 'ALL SCENES' ? (
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '1s' : '0s' }}>
              {/* 左侧：巨型标识与控制台宣言 */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-12 relative">
                {/* 动态波浪线层 */}
                <div className="absolute inset-0 z-[-1] opacity-50 mix-blend-screen pointer-events-none -m-12">
                  <WavyLines interactive={false} />
                </div>
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-widest mb-6 border-l-2 border-[#E8E8E1] pl-3">
                    SYS.IDENT // OVERRIDE
                  </h3>
                  <h1 className="font-serif-display text-5xl md:text-7xl lg:text-[5.5rem] text-[#E8E8E1] tracking-tighter leading-[0.9] uppercase mix-blend-difference">
                    DIGITAL<br />CRAFTSMAN.
                  </h1>
                </div>

                <div className="relative pl-6 border-l border-dashed border-[#333] mt-4">
                  <div className="absolute top-0 left-[-4px] w-2 h-2 bg-[#E8E8E1]" style={{ animation: 'flicker 3s infinite' }}></div>
                  <div className="font-mono-data text-[#888] text-[11px] md:text-xs leading-relaxed max-w-xl space-y-4">
                    <p className="text-[#aaa]">&gt; INITIALIZING CORE PROTOCOLS...</p>
                    <p className="text-[#aaa]">&gt; STATUS: <span className="text-[#E8E8E1]">ONLINE</span></p>
                    <p className="pt-2">
                      大学牲一枚。热爱看番、音乐、交互设计，以及 旮旯干木。<br />
                    </p>
                  </div>
                </div>
              </div>

              {/* 右侧：HUD 数据化面板 */}
              <div className="lg:col-span-5 flex flex-col gap-12">
                {/* 技能矩阵 */}
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-[0.3em] mb-5">
                    [ MODULES_LOADED ]
                  </h3>
                  <div className="flex flex-col gap-2">
                    {['REACT // DOM_ENGINE', 'TAILWIND // STYLING', 'TYPESCRIPT // LOGIC', 'CANVAS // FX_RENDER', 'NODE.JS // SYS_CORE'].map((skill) => (
                      <div key={skill} className="group relative border border-[#222] bg-[#050505] p-3 hover:border-[#555] transition-colors cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-[#E8E8E1] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></div>
                        <span className="relative z-10 font-mono-data text-[10px] tracking-widest text-[#888] group-hover:text-[#050505] transition-colors duration-500">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 核心指令 */}
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-[0.3em] mb-5">
                    [ CURRENT_DIRECTIVES ]
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4 group">
                      <span className="text-[#E8E8E1] font-mono-data text-xs mt-1">01</span>
                      <p className="font-serif-display text-[#888] group-hover:text-[#ccc] transition-colors text-sm md:text-base leading-snug">
                        Exploring the boundaries of physical interactions in web environments.
                      </p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="text-[#E8E8E1] font-mono-data text-xs mt-1">02</span>
                      <p className="font-serif-display text-[#888] group-hover:text-[#ccc] transition-colors text-sm md:text-base leading-snug">
                        Developing game-like mechanics for everyday productivity (GameLife).
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '1s' : '0s' }}>
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col"
                >
                  {/* Full Card Link Overlay */}
                  {post.url.startsWith('http') ? (
                    <a href={post.url} target="_blank" rel="noreferrer" className="absolute inset-0 z-20">
                      <span className="sr-only">Go to {post.title}</span>
                    </a>
                  ) : (
                    <Link to={post.url} className="absolute inset-0 z-20">
                      <span className="sr-only">Go to {post.title}</span>
                    </Link>
                  )}

                  <div className="overflow-hidden relative mb-6 aspect-square w-full bg-[#050505]">
                    <div className="absolute inset-0 border border-[#111] group-hover:border-[#444] z-20 transition-colors duration-700 pointer-events-none"></div>

                    {/* ====== Hover 专属特效：横向扫描带 & 频闪划痕 & 竖向胶片划痕 ====== */}
                    <div className="absolute left-0 right-0 h-24 bg-noise mix-blend-overlay z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-scanline"></div>
                    <div className="absolute left-0 right-0 h-[1px] bg-white/40 z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-flicker"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-0 mix-blend-overlay z-30 pointer-events-none fx-scratch"></div>

                    {post.hasCustomImage ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className={`w-full h-full object-cover opacity-50 transition-all duration-[1.5s] ease-out
                          ${post.type === 'LIFE_LOG' ? 'grayscale contrast-125 group-hover:grayscale-0' : 'sepia-[.8] hue-rotate-[180deg] saturate-50 group-hover:saturate-100'} 
                          group-hover:opacity-100 group-hover:scale-[1.05]`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center bg-[#080808] opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-[1.5s] ease-out relative">
                        {/* 极简网格背景 */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <h4 className="font-serif-display text-2xl text-[#E8E8E1] mb-2 z-10">{post.title}</h4>
                        <div className="w-8 h-[1px] bg-[#444] my-2 z-10"></div>
                        <p className="font-mono-data text-[8px] text-[#888] tracking-widest uppercase z-10">{post.subtitle}</p>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-40 font-mono-data text-[9px] tracking-widest bg-black/80 text-[#E8E8E1] px-2 py-1 border border-[#333] backdrop-blur-sm">
                      {post.type}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow relative z-10">
                    <div className="font-mono-data text-[9px] tracking-[0.2em] text-[#555] mb-3 flex items-center justify-between">
                      <span>ID: {post.id}</span>
                      <span className={`flex items-center gap-1 ${post.status === 'ONLINE' ? 'text-[#a3c2a4]' : (post.status === 'EXPERIMENTAL' ? 'text-[#c2a381]' : 'text-[#666]')}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'ONLINE' ? 'bg-[#a3c2a4]' : (post.status === 'EXPERIMENTAL' ? 'bg-[#c2a381]' : 'bg-[#666]')} animate-pulse`}></span>
                        {post.status}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-xl md:text-2xl text-[#C4C4BA] mb-2 group-hover:text-[#E8E8E1] transition-colors duration-700 tracking-wide line-clamp-2">
                      {post.title}
                    </h3>

                    <div className="font-mono-data text-[9px] tracking-[0.2em] text-[#666] mb-4 uppercase">
                      {post.subtitle}
                    </div>

                    <p className="font-serif-display text-xs text-[#777] leading-relaxed mb-8 opacity-90 text-justify line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between font-mono-data text-[9px] tracking-[0.2em] mt-auto pt-4 border-t border-[#1a1a1a] relative z-30 pointer-events-auto">
                      <span className="text-[#444]">{post.date}</span>
                      {post.url.startsWith('http') ? (
                        <a href={post.url} target="_blank" rel="noreferrer" className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-2 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-4 h-[1px] bg-[#555] group-hover/btn:w-8 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </a>
                      ) : (
                        <Link to={post.url} className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-2 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-4 h-[1px] bg-[#555] group-hover/btn:w-8 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-40 text-center font-mono-data border-t border-[#151515] pt-20 pb-12 relative z-10">
          <div className="w-[1px] h-12 bg-[#222] mx-auto mb-10"></div>
          <div className="text-[9px] text-[#444] tracking-[0.3em] space-y-3 leading-relaxed">
            <p>DESIGNED & DIRECTED BY L.K.L</p>
            <p>SYS.VER 2.0.4 / HYBRID ARCHIVE</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;
