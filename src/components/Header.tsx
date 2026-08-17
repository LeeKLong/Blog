import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sfx } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const [sfxEnabled, setSfxEnabled] = useState(sfx.enabled);
  const [copied, setCopied] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleCopyUID = async () => {
    try {
      await navigator.clipboard.writeText('1145077480');
      setCopied(true);
      sfx.playBeep(900, 0.08);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleToggleSfx = () => {
    const enabled = sfx.toggle();
    setSfxEnabled(enabled);
    if (enabled) sfx.playBeep(800, 0.08);
  };

  const handleNavClick = () => {
    sfx.playBeep(760, 0.045);
  };

  useEffect(() => {
    setIsNavOpen(false);
  }, [location]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-endfield-bg/95 border-b border-endfield-border backdrop-blur px-4 py-2.5 flex items-center justify-between text-xs font-tech">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNavOpen(!isNavOpen)} className="font-bold tracking-widest text-endfield-dark flex items-center gap-1.5 cursor-pointer select-none" aria-expanded={isNavOpen}>
            <span className="w-2 h-2 bg-endfield-dark inline-block"></span>
            <span>// LEEKLONG</span>
            <i className={`fa-solid fa-chevron-down text-[9px] text-endfield-muted lg:hidden transition-transform ${isNavOpen ? 'rotate-180' : ''}`}></i>
          </button>
          <span className="text-endfield-muted hidden sm:inline">|</span>
          <span className="text-endfield-muted text-[11px] hidden md:inline">ENDFIELD OPERATOR IDENTITY SYSTEM</span>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-endfield-muted">
          <Link to="/" onClick={handleNavClick} className={`hover:text-endfield-dark transition-colors desktop-nav-item flex items-center gap-1 ${location.pathname === '/' ? 'current font-bold' : ''}`}>
            <span className={`text-endfield-yellow desktop-nav-arrow ${location.pathname === '/' ? 'inline' : 'hidden'}`}>▸</span> 主页
          </Link>
          <Link to="/archive" onClick={handleNavClick} className={`hover:text-endfield-dark transition-colors desktop-nav-item flex items-center gap-1 ${location.pathname === '/archive' ? 'current font-bold' : ''}`}>
            <span className={`text-endfield-yellow desktop-nav-arrow ${location.pathname === '/archive' ? 'inline' : 'hidden'}`}>▸</span> 档案室
          </Link>
          <Link to="/about" onClick={handleNavClick} className={`hover:text-endfield-dark transition-colors desktop-nav-item flex items-center gap-1 ${location.pathname === '/about' ? 'current font-bold' : ''}`}>
            <span className={`text-endfield-yellow desktop-nav-arrow ${location.pathname === '/about' ? 'inline' : 'hidden'}`}>▸</span> 名片
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-[11px] font-tech text-endfield-muted">
          <button onClick={handleToggleSfx} className="px-2 py-0.5 border border-endfield-border bg-white hover:border-endfield-dark text-endfield-dark transition-all flex items-center gap-1.5 cursor-pointer" title="点击切换战术音效">
            <i className={`fa-solid ${sfxEnabled ? 'fa-volume-high text-endfield-dark dark:text-endfield-yellow' : 'fa-volume-xmark text-endfield-muted'} text-xs`}></i>
            <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span>
            <span>81ms</span>
          </div>
          <div 
            onClick={handleCopyUID}
            className="relative group/uid hidden sm:block select-none cursor-pointer"
            title="点击复制UID"
          >
            <div>UID: <span className="text-endfield-dark font-bold group-hover/uid:text-endfield-yellowDark transition-colors">1145077480</span></div>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 -translate-y-1 group-hover/uid:opacity-100 group-hover/uid:translate-y-0 transition-all duration-150 z-50 flex flex-col items-center">
              <div className="w-2 h-2 bg-endfield-dark rotate-45 border-t border-l border-endfield-yellow -mb-1 z-10"></div>
              <div className="bg-endfield-dark text-white px-2.5 py-1.5 border border-endfield-yellow shadow-xl flex items-center gap-1.5 whitespace-nowrap text-[11px] font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span>
                <span>{copied ? '已复制到剪贴板喵~' : '真实UID，欢迎扩列喵'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="w-7 h-7 bg-white border border-endfield-border hover:bg-endfield-dark hover:text-white dark:hover:bg-neutral-800 flex items-center justify-center transition-all cursor-pointer" 
            title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
          >
            <i className={`fa-solid ${isDark ? 'fa-sun text-endfield-yellow' : 'fa-moon text-endfield-dark'} text-xs`}></i>
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      <div id="mobile-nav" className={`absolute top-[44px] left-0 right-0 z-50 lg:hidden bg-white dark:bg-endfield-dark text-endfield-dark dark:text-white border-b border-endfield-border dark:border-neutral-800 shadow-2xl ${isNavOpen ? 'open' : 'closing'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }}></div>
        <div className="relative z-10 h-[2px] bg-endfield-yellow w-full"></div>
        <nav className="relative z-10 font-tech text-sm">
          <Link to="/" onClick={handleNavClick} className={`mobile-nav-item flex items-center justify-between px-5 py-4 border-b border-l-2 border-endfield-border/60 dark:border-white/10 hover:border-l-endfield-yellow hover:bg-endfield-yellow hover:text-endfield-dark transition-colors group ${location.pathname === '/' ? 'current border-l-endfield-yellow bg-black/[0.03] dark:bg-white/5 font-bold text-endfield-dark dark:text-white' : 'border-l-transparent text-endfield-muted dark:text-neutral-300'}`}>
            <span className="flex items-center gap-3 tracking-wide">
              <span className={`mobile-nav-arrow transition-colors ${location.pathname === '/' ? 'text-endfield-yellow' : 'text-endfield-muted/40 dark:text-white/30 group-hover:text-endfield-dark'}`}>▸</span>
              <span>主页</span>
              <span className="text-[10px] font-normal text-endfield-muted dark:text-white/30 group-hover:text-endfield-dark/70 tracking-widest">HOME</span>
            </span>
            <span className="text-[10px] tracking-widest text-endfield-muted/70 dark:text-white/30 group-hover:text-endfield-dark/70">[SECTOR-01]</span>
          </Link>
          <Link to="/archive" onClick={handleNavClick} className={`mobile-nav-item flex items-center justify-between px-5 py-4 border-b border-l-2 border-endfield-border/60 dark:border-white/10 hover:border-l-endfield-yellow hover:bg-endfield-yellow hover:text-endfield-dark transition-colors group ${location.pathname === '/archive' ? 'current border-l-endfield-yellow bg-black/[0.03] dark:bg-white/5 font-bold text-endfield-dark dark:text-white' : 'border-l-transparent text-endfield-muted dark:text-neutral-300'}`}>
            <span className="flex items-center gap-3 tracking-wide">
              <span className={`mobile-nav-arrow transition-colors ${location.pathname === '/archive' ? 'text-endfield-yellow' : 'text-endfield-muted/40 dark:text-white/30 group-hover:text-endfield-dark'}`}>▸</span>
              <span>档案室</span>
              <span className="text-[10px] font-normal text-endfield-muted dark:text-white/30 group-hover:text-endfield-dark/70 tracking-widest">ARCHIVE</span>
            </span>
            <span className="text-[10px] tracking-widest text-endfield-muted/70 dark:text-white/30 group-hover:text-endfield-dark/70">[SECTOR-02]</span>
          </Link>
          <Link to="/about" onClick={handleNavClick} className={`mobile-nav-item flex items-center justify-between px-5 py-4 border-b border-l-2 border-endfield-border/60 dark:border-white/10 hover:border-l-endfield-yellow hover:bg-endfield-yellow hover:text-endfield-dark transition-colors group ${location.pathname === '/about' ? 'current border-l-endfield-yellow bg-black/[0.03] dark:bg-white/5 font-bold text-endfield-dark dark:text-white' : 'border-l-transparent text-endfield-muted dark:text-neutral-300'}`}>
            <span className="flex items-center gap-3 tracking-wide">
              <span className={`mobile-nav-arrow transition-colors ${location.pathname === '/about' ? 'text-endfield-yellow' : 'text-endfield-muted/40 dark:text-white/30 group-hover:text-endfield-dark'}`}>▸</span>
              <span>名片</span>
              <span className="text-[10px] font-normal text-endfield-muted dark:text-white/30 group-hover:text-endfield-dark/70 tracking-widest">ABOUT</span>
            </span>
            <span className="text-[10px] tracking-widest text-endfield-muted/70 dark:text-white/30 group-hover:text-endfield-dark/70">[SECTOR-03]</span>
          </Link>
        </nav>

        {/* Mobile Operator UID Card */}
        <div className="relative z-10 mx-4 my-3 p-3 bg-black/[0.03] dark:bg-white/5 border border-endfield-border dark:border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-tech text-endfield-muted dark:text-white/60">
              <span>UID //</span>
              <span className="text-endfield-dark dark:text-white font-bold tracking-wider font-tech">1145077480</span>
            </div>
            <div className="text-[10px] text-endfield-dark/80 dark:text-endfield-yellow flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow border border-endfield-dark/20 animate-pulse"></span>
              <span className="font-sans">真实UID，欢迎扩列喵</span>
            </div>
          </div>
          <button
            onClick={handleCopyUID}
            className="px-2.5 py-1 text-[11px] font-tech border border-endfield-border bg-white text-endfield-dark hover:border-endfield-dark hover:bg-endfield-dark hover:text-white dark:border-endfield-yellow/40 dark:bg-endfield-yellow/10 dark:text-endfield-yellow dark:hover:bg-endfield-yellow dark:hover:text-endfield-dark active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-green-500 dark:text-endfield-yellow' : 'fa-copy'} text-xs`}></i>
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>

        <div className="relative z-10 px-5 py-3 flex items-center justify-between text-[10px] font-tech tracking-widest text-endfield-muted dark:text-white/40 border-t border-endfield-border/60 dark:border-white/10">
          <span>ENDFIELD OPERATOR IDENTITY SYSTEM</span>
          <span className="text-endfield-dark dark:text-endfield-yellow font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span> ONLINE</span>
        </div>
      </div>
    </>
  );
}
