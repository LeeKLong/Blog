import { useState, useEffect } from 'react';

interface AboutOverviewProps {
  isActive: boolean;
  onCopyUID: () => void;
  isMasked?: boolean;
}

export default function AboutOverview({ isActive, onCopyUID, isMasked }: AboutOverviewProps) {
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
    <div className={`tab-panel space-y-6 ${isActive ? 'block' : 'hidden'}`}>
      {/* Top Profile & Stage Info Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Profile Box */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with Endfield Yellow Framing */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-endfield-dark p-1 shadow-lg shrink-0 group">
            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center border border-endfield-yellow">
              <img src={`${import.meta.env.BASE_URL}LEEKLONG.svg`} className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" alt="Avatar" />
              <span className="absolute bottom-1 right-1 bg-endfield-yellow text-endfield-dark font-tech font-bold text-[9px] px-1">O.M.V</span>
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-endfield-yellow text-endfield-dark text-[10px] font-tech font-bold px-1 border border-endfield-dark">
              <i className="fa-solid fa-cross"></i> 2569
            </div>
          </div>

          {/* Name, Level & Stage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-endfield-dark tracking-tight font-sans">
                省厅李总队<span className="text-endfield-muted font-tech text-xl">#2569</span>
              </h1>
              <button className="p-1 text-endfield-muted hover:text-endfield-dark cursor-pointer" title="复制编号" onClick={onCopyUID}>
                <i className="fa-regular fa-copy text-xs"></i>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-tech text-endfield-muted">
              <span className="bg-endfield-dark text-white px-2 py-0.5 font-bold">▶▶ 注册日 2026/01/22</span>
              <span className="border border-endfield-border px-1.5 py-0.5 bg-white font-mono">{isMasked ? '11450****0' : '1145077480'}</span>
            </div>

            <div className="pt-1 flex items-center gap-6 font-tech">
              <div>
                <div className="text-[10px] text-endfield-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 bg-endfield-dark"></span> 权限等级
                </div>
                <div className="text-2xl font-bold text-endfield-dark leading-none">60</div>
              </div>
              <div className="border-l border-endfield-border pl-6">
                <div className="text-[10px] text-endfield-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 bg-endfield-yellow border border-endfield-dark"></span> 探索等级
                </div>
                <div className="text-2xl font-bold text-endfield-dark leading-none">7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Operation Stage Card ("GitHub / 主页") */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-endfield-darkCard text-white p-4 relative overflow-hidden clip-slash-corner border-l-4 border-endfield-yellow shadow-xl group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5fe00_1px,transparent_1px)] [background-size:12px_12px]"></div>

            <div className="relative z-10 space-y-2">
              <div className="text-[10px] font-tech text-endfield-yellow tracking-widest uppercase flex justify-between">
                <span>[ CURRENT OPERATION ]</span>
                <span>STATUS: ACTIVE</span>
              </div>
              <div className="text-xl font-black font-title text-white tracking-wide group-hover:text-endfield-yellow transition-colors">
                GitHub / 主页
              </div>
              <p className="text-xs text-slate-300 font-sans line-clamp-2">
                全栈架构开发 / 3D 交互场景设计 / WebGL 高性能图形管线构建中...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Stat Counters */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-endfield-border">
        <a href="https://github.com/LeeKLong" target="_blank" rel="noreferrer" className="block bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all group">
          <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark group-hover:text-endfield-yellowDark transition-colors">
            {reposCount}
          </div>
          <div className="text-xs font-bold text-endfield-muted flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-endfield-dark"></span>  // 项目数
          </div>
        </a>

        <div className="bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all">
          <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark">91</div>
          <div className="text-xs font-bold text-endfield-muted flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-endfield-yellow border border-endfield-dark"></span>  // 核心技术栈
          </div>
        </div>

        <div className="bg-white/80 p-3 sm:p-4 border border-endfield-border hover:border-endfield-dark transition-all">
          <div className="text-3xl sm:text-4xl font-black font-tech text-endfield-dark">
            {commitsCount}
          </div>
          <div className="text-xs font-bold text-endfield-muted flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 border border-endfield-dark"></span>  // 代码提交
          </div>
        </div>
      </div>

      {/* District Infrastructure Summary */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-tech text-endfield-muted flex items-center gap-2">
          <span className="w-2 h-0.5 bg-endfield-yellow"></span>
          <span>地区建设概况 // INFRASTRUCTURE REGIONS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech text-xs">
          <div className="p-2.5 bg-white border border-endfield-border flex items-center justify-between">
            <span className="text-endfield-muted">四号谷地</span>
            <span className="font-bold text-endfield-dark">LVL 12</span>
          </div>
          <div className="p-2.5 bg-white border border-endfield-border flex items-center justify-between">
            <span className="text-endfield-muted">武陵地区</span>
            <span className="font-bold text-endfield-dark">LVL 18</span>
          </div>
          <div className="p-2.5 bg-white border border-endfield-border flex items-center justify-between">
            <span className="text-endfield-muted">核心协议枢纽</span>
            <span className="font-bold text-endfield-dark">LVL 09</span>
          </div>
          <div className="p-2.5 bg-white border border-endfield-border flex items-center justify-between">
            <span className="text-endfield-muted">技术研发中枢</span>
            <span className="font-bold text-endfield-dark">MAX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
