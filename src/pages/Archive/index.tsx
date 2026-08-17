import { useEffect, useState } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import AndroidShell from './components/AndroidShell';
import WindowLayer from './components/WindowLayer';
import { Link } from 'react-router-dom';
import { sfx } from '../../utils/sound';
import { useTheme } from '../../context/ThemeContext';

function ArchiveOSLayout() {
  const { state, dispatch } = useOS();
  const { isDark, toggleTheme } = useTheme();
  const [sfxEnabled, setSfxEnabled] = useState(sfx.enabled);

  useEffect(() => {
    const handleResize = () => {
      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      dispatch({ type: 'SET_MOBILE_MODE', payload: (isTouch && isSmallScreen) || window.innerWidth < 768 });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // Handle global shortcuts like Alt+Tab, Ctrl+W here in a useEffect
  
  if (state.isMobileMode) {
    return <AndroidShell />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-topo flex flex-col font-sans select-none overflow-hidden text-sm">
      {/* Topographic Dots Background Texture */}
      <div className="bg-topo fixed inset-0 z-0 pointer-events-none"></div>

      {/* Top Sub-Header Bar (Endfield System Nav) */}
      <header className="flex-none sticky top-0 z-40 bg-endfield-bg/95 border-b border-endfield-border backdrop-blur px-4 py-2.5 flex items-center justify-between text-xs font-tech">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest text-endfield-dark flex items-center gap-1.5">
            <span className="w-2 h-2 bg-endfield-dark inline-block"></span>
            // 个人风格网站
          </span>
          <span className="text-endfield-muted hidden sm:inline">|</span>
          <span className="text-endfield-muted text-[11px] hidden md:inline">COMBAT OPERATIONS ARCHIVE</span>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-endfield-muted">
          <Link to="/" className="hover:text-endfield-dark transition-colors">主页</Link>
          <button className="hover:text-endfield-dark transition-colors flex items-center gap-1 cursor-default"><span className="text-endfield-yellow">▸</span> 档案室</button>
          <Link to="/about" className="hover:text-endfield-dark transition-colors">名片</Link>
        </nav>

        <div className="flex items-center gap-3 text-[11px] font-tech text-endfield-muted">
          <button 
            className="px-2 py-0.5 border border-endfield-border bg-white hover:border-endfield-dark text-endfield-dark transition-all flex items-center gap-1.5 cursor-pointer" 
            title="点击切换战术音效"
            onClick={() => {
              const isOn = sfx.toggle();
              setSfxEnabled(isOn);
              if (isOn) sfx.playBeep(800, 0.05);
            }}
          >
            <i className={`fa-solid ${sfxEnabled ? 'fa-volume-high text-endfield-dark dark:text-endfield-yellow' : 'fa-volume-xmark text-endfield-muted'} text-xs`}></i>
            <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span>
            <span>81ms</span>
          </div>
          <div className="relative group/uid hidden sm:block select-none cursor-pointer">
            <div>UID: <span className="text-endfield-dark font-bold group-hover/uid:text-endfield-yellowDark transition-colors">1145077480</span></div>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 -translate-y-1 group-hover/uid:opacity-100 group-hover/uid:translate-y-0 transition-all duration-150 z-50 flex flex-col items-center">
              <div className="w-2 h-2 bg-endfield-dark rotate-45 border-t border-l border-endfield-yellow -mb-1 z-10"></div>
              <div className="bg-endfield-dark text-white px-2.5 py-1.5 border border-endfield-yellow shadow-xl flex items-center gap-1.5 whitespace-nowrap text-[11px] font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span>
                <span>真实UID，欢迎扩列喵</span>
              </div>
            </div>
          </div>
          <button 
            className="w-7 h-7 bg-white border border-endfield-border hover:bg-endfield-dark hover:text-white flex items-center justify-center transition-all cursor-pointer" 
            title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
            onClick={toggleTheme}
          >
            <i className={`fa-solid ${isDark ? 'fa-sun text-endfield-yellow' : 'fa-moon text-endfield-dark'} text-xs`}></i>
          </button>
        </div>
      </header>

      {/* Main Desktop Area */}
      <main className="relative flex-1 overflow-hidden">
        <Desktop />
        <WindowLayer />
      </main>

      {/* OS Components */}
      {state.startMenuOpen && <StartMenu />}
      <Taskbar />

      {/* Toast Stack */}
      <div className="fixed bottom-[60px] right-3 z-[9000] flex flex-col gap-2 items-end pointer-events-none">
        {state.toastStack.map(toast => (
          <div key={toast.id} className="toast border-2 border-endfield-dark bg-white shadow-2xl px-3 py-2 flex items-center gap-2 text-xs font-tech">
            <i className={`fa-solid ${toast.icon} text-endfield-yellow`}></i>
            <span className="text-endfield-dark font-bold">{toast.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Archive() {
  return (
    <OSProvider>
      <ArchiveOSLayout />
    </OSProvider>
  );
}
