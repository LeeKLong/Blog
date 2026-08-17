import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const [reposCount, setReposCount] = useState<number | string>('--');
  const commitsCount = '--'; // Total commits usually requires a GraphQL token to fetch dynamically

  useEffect(() => {
    // Fetch GitHub Public Repositories Count
    fetch('https://api.github.com/users/LeeKLong')
      .then(res => res.json())
      .then(data => {
        if (data.public_repos !== undefined) {
          setReposCount(data.public_repos);
        }
      })
      .catch(err => console.error('Failed to fetch GitHub stats:', err));
  }, []);

  return (
    <main className="relative z-10">
      {/* ============ HERO ============ */}
      <section id="hero" className="relative flex flex-col justify-center min-h-[calc(100vh-44px)] overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-14 grid lg:grid-cols-12 gap-10 items-center">

          {/* Left: Intro */}
          <div className="lg:col-span-7">
            <div data-reveal className="text-xs font-tech text-endfield-muted tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-endfield-yellow border border-endfield-dark inline-block"></span>
              // 个人门户 PERSONAL PORTAL — 终端在线
            </div>

            <h1 data-reveal className="mt-5 text-5xl sm:text-6xl xl:text-7xl font-black text-endfield-dark tracking-tight leading-none">
              LEEKLONG
            </h1>

            <div data-reveal className="mt-4 inline-flex items-center gap-2 font-title font-bold tracking-[0.25em] text-endfield-dark">
              <span className="bg-endfield-dark text-endfield-yellow px-2 py-1 text-xs font-tech">ENDFIELD</span>
              <span className="text-xl sm:text-2xl">OPERATOR</span>
            </div>

            <p data-reveal className="mt-5 max-w-xl text-sm sm:text-base text-endfield-text/80 leading-relaxed font-sans">
              大学牲一枚。热爱看番、音乐、交互设计，以及 旮旯干木。
            </p>

            {/* Quote */}
            <div data-reveal className="mt-6 flex items-center gap-3 italic text-endfield-dark font-sans bg-white/60 dark:bg-white/5 px-4 py-2.5 border border-endfield-border shadow-sm w-fit">
              <span className="text-xl font-bold font-serif text-endfield-muted">“</span>
              <span className="font-medium">大学牲一枚。热爱看番、音乐、交互设计，以及 旮旯干木。</span>
              <span className="text-xl font-bold font-serif text-endfield-muted">”</span>
            </div>

            {/* Stats */}
            <div data-reveal className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
              <a href="https://github.com/LeeKLong" target="_blank" rel="noreferrer" className="block bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all cursor-pointer group">
                <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark group-hover:text-endfield-yellowDark transition-colors">
                  {reposCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-endfield-muted mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-endfield-dark"></span> 仓库 / 项目数</div>
              </a>
              <div className="bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all">
                <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark">91</div>
                <div className="text-[10px] sm:text-xs font-bold text-endfield-muted mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-endfield-yellow border border-endfield-dark"></span> 武器 / 技术栈</div>
              </div>
              <div className="bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all">
                <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark">
                  {commitsCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-endfield-muted mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600"></span> 档案 / 代码提交</div>
              </div>
            </div>

            {/* CTAs */}
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/archive" className="px-8 py-3 topo-accent-bg border border-endfield-dark text-endfield-dark font-bold hover:bg-endfield-dark hover:text-white transition-all shadow-md flex items-center gap-2 font-tech text-sm">
                <i className="fa-solid fa-tower-broadcast"></i>
                <span>进入终端 ENTER TERMINAL</span>
              </Link>
              <Link to="/archive" className="px-8 py-3 bg-white border border-endfield-border hover:border-endfield-dark text-endfield-dark font-bold transition-all flex items-center gap-2 font-tech text-sm">
                <i className="fa-solid fa-cubes-stacked"></i>
                <span>查看作战记录</span>
              </Link>
            </div>
          </div>

          {/* Right: Operator Card Preview */}
          <div data-reveal className="lg:col-span-5 w-full">
            <a href="https://github.com/LeeKLong" target="_blank" rel="noreferrer" className="block group">
              <div className="bg-endfield-panel border border-endfield-border shadow-2xl overflow-hidden clip-slash-corner transition-all group-hover:shadow-[0_0_0_2px_#e5fe00]">
                {/* Card Header Stripe */}
                <div className="flex items-center justify-between bg-endfield-dark text-endfield-yellow px-4 py-2 font-tech text-[10px] tracking-widest">
                  <span>[ OPERATOR CARD ]</span>
                  <span>O.M.V // 2569</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-endfield-dark p-1 shrink-0">
                      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center border border-endfield-yellow">
                        <img src={`${import.meta.env.BASE_URL}LEEKLONG.svg`} className="w-12 h-12 object-contain opacity-90 group-hover:scale-110 transition-transform" alt="Avatar" />
                        <span className="absolute bottom-1 right-1 bg-endfield-yellow text-endfield-dark font-tech font-bold text-[8px] px-1">O.M.V</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-lg font-black text-endfield-dark">LEEKLONG <span className="text-endfield-muted font-tech text-sm">#2569</span></div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-tech text-endfield-muted">
                        <span className="bg-endfield-dark text-white px-2 py-0.5 font-bold">▶▶ 注册日 2026/01/22</span>
                      </div>
                      <div className="flex items-center gap-4 font-tech pt-1">
                        <div>
                          <div className="text-[9px] text-endfield-muted tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 bg-endfield-dark"></span> 权限等级</div>
                          <div className="text-lg font-bold text-endfield-dark leading-none">60</div>
                        </div>
                        <div className="border-l border-endfield-border pl-4">
                          <div className="text-[9px] text-endfield-muted tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 bg-endfield-yellow border border-endfield-dark"></span> 探索等级</div>
                          <div className="text-lg font-bold text-endfield-dark leading-none">7</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Operation */}
                  <div className="bg-endfield-darkCard text-white p-3 relative overflow-hidden clip-slash-corner border-l-4 border-endfield-yellow shadow-xl">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5fe00_1px,transparent_1px)]" style={{ backgroundSize: '12px 12px' }}></div>
                    <div className="relative z-10 space-y-1.5">
                      <div className="text-[9px] font-tech text-endfield-yellow tracking-widest uppercase flex justify-between">
                        <span>[ CURRENT OPERATION ]</span>
                        <span>STATUS: ACTIVE</span>
                      </div>
                      <div className="text-base font-black font-title text-white tracking-wide group-hover:text-endfield-yellow transition-colors">GitHub 主页</div>
                      <p className="text-[10px] text-slate-300 font-sans">全栈架构开发 / 3D 交互场景设计 / WebGL 高性能图形管线构建中...</p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between font-tech text-[10px] text-endfield-muted pt-1">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span> TERMINAL ONLINE</span>
                    <span className="text-endfield-dark font-bold group-hover:text-endfield-yellow transition-colors">访问 GITHUB <i className="fa-solid fa-arrow-right text-[9px]"></i></span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Tech Ticker */}
        <div data-reveal className="relative border-y border-endfield-border bg-endfield-dark text-endfield-yellow font-tech text-[11px] tracking-[0.2em] overflow-hidden select-none">
          <div className="ticker-track py-2">
            <span className="flex items-center gap-6 pr-6">
              <span>REACT</span><span>▮</span><span>NEXT.JS</span><span>▮</span><span>TYPESCRIPT</span><span>▮</span><span>THREE.JS</span><span>▮</span><span>WEBGL</span><span>▮</span><span>TAILWIND</span><span>▮</span><span>GSAP</span><span>▮</span><span>NODE.JS</span><span>▮</span><span>SHADER</span><span>▮</span><span>WEB AUDIO</span><span>▮</span>
            </span>
            <span className="flex items-center gap-6 pr-6">
              <span>REACT</span><span>▮</span><span>NEXT.JS</span><span>▮</span><span>TYPESCRIPT</span><span>▮</span><span>THREE.JS</span><span>▮</span><span>WEBGL</span><span>▮</span><span>TAILWIND</span><span>▮</span><span>GSAP</span><span>▮</span><span>NODE.JS</span><span>▮</span><span>SHADER</span><span>▮</span><span>WEB AUDIO</span><span>▮</span><span>都不会只是个装饰</span>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
