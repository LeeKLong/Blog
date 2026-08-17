import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { getProjects, ABOUT_PROJECT, type Project } from '../../../utils/projects';
import { sfx } from '../../../utils/sound';
import { useTheme } from '../../../context/ThemeContext';

interface ActivityItem {
  id: string;
  project: Project;
  isAbout?: boolean;
}

export default function AndroidShell() {
  const { isDark, toggleTheme } = useTheme();
  const [sfxEnabled, setSfxEnabled] = useState(sfx.enabled);
  const [clock, setClock] = useState('--:--');
  const [activityStack, setActivityStack] = useState<ActivityItem[]>([]);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [shadeOpen, setShadeOpen] = useState(false);
  const [sheetData, setSheetData] = useState<ActivityItem | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; icon: string } | null>(null);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'ENDFIELD OS · 系统就绪', desc: '终端开机完成 · 欢迎回到作战档案室', time: '刚刚' }
  ]);
  const [quickTiles, setQuickTiles] = useState({
    wifi: true,
    bt: false,
    torch: false,
    plane: false,
    loc: true,
  });

  const toastTimerRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Status bar clock tick
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, icon = 'fa-circle-info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg({ msg, icon });
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  };

  const projects = getProjects();
  const allApps: ActivityItem[] = [
    { id: 'about', project: ABOUT_PROJECT, isAbout: true },
    ...projects.map(p => ({ id: p.id, project: p, isAbout: false }))
  ];

  // Open App / Activity
  const handleOpenApp = (app: ActivityItem) => {
    sfx.playBeep(920, 0.05);
    setActivityStack(prev => {
      const exists = prev.find(a => a.id === app.id);
      if (exists) {
        return [...prev.filter(a => a.id !== app.id), exists];
      }
      return [...prev, app];
    });
    setActiveActivityId(app.id);
    setCatalogOpen(false);
    setShadeOpen(false);
    setSheetData(null);
    showToast(`已启动 ${app.project.title}`, 'fa-bolt');
  };

  // Close Activity
  const handleCloseActivity = (id: string) => {
    sfx.playBeep(680, 0.04);
    setActivityStack(prev => {
      const updated = prev.filter(a => a.id !== id);
      if (activeActivityId === id) {
        setActiveActivityId(updated.length > 0 ? updated[updated.length - 1].id : null);
      }
      return updated;
    });
  };

  // Navigation Keys
  const handleBack = () => {
    sfx.playBeep(560, 0.035);
    if (sheetData) {
      setSheetData(null);
      return;
    }
    if (shadeOpen) {
      setShadeOpen(false);
      return;
    }
    if (catalogOpen) {
      setCatalogOpen(false);
      return;
    }
    if (activeActivityId) {
      handleCloseActivity(activeActivityId);
      return;
    }
    showToast('已在桌面', 'fa-house');
  };

  const handleHome = () => {
    sfx.playBeep(520, 0.04);
    setActiveActivityId(null);
    setCatalogOpen(false);
    setShadeOpen(false);
    setSheetData(null);
    showToast('已返回桌面', 'fa-house');
  };

  const handleToggleCatalog = () => {
    sfx.playBeep(780, 0.04);
    setCatalogOpen(prev => !prev);
    setShadeOpen(false);
    setSheetData(null);
  };

  // Tile Actions
  const handleToggleTile = (key: keyof typeof quickTiles) => {
    sfx.playBeep(720, 0.03);
    setQuickTiles(prev => {
      const nextVal = !prev[key];
      const names: Record<string, string> = { wifi: 'WLAN', bt: '蓝牙', torch: '手电筒', plane: '飞行模式', loc: '定位' };
      showToast(`模拟操作：${names[key] || key} ${nextVal ? '已开启' : '已关闭'}`, 'fa-wand-magic-sparkles');
      return { ...prev, [key]: nextVal };
    });
  };

  const handleToggleSfxTile = () => {
    const nextSfx = sfx.toggle();
    setSfxEnabled(nextSfx);
    if (nextSfx) sfx.playBeep(800, 0.08);
    showToast(`音效已${nextSfx ? '开启' : '关闭'}`, nextSfx ? 'fa-volume-high' : 'fa-volume-xmark');
  };

  const handleTouchStart = (app: ActivityItem) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      sfx.playBeep(850, 0.05);
      setSheetData(app);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleAppClick = (app: ActivityItem) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    handleOpenApp(app);
  };

  const activeActivity = activityStack.find(a => a.id === activeActivityId);

  // Filtered Apps in Catalog
  const filteredApps = allApps.filter(app => 
    app.project.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    app.project.sector.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    app.project.tech.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.035, delayChildren: 0.05 }
    }
  };

  const appIconVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141414] text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. Android Status Bar with Pull Down Indicator */}
      <motion.div 
        onClick={() => {
          sfx.playBeep(700, 0.03);
          setShadeOpen(prev => !prev);
        }}
        whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        className="flex-none h-10 bg-[#101010]/95 border-b border-white/10 text-white flex items-center justify-between px-3.5 font-tech text-xs tracking-wider z-30 cursor-pointer select-none"
      >
        <span className="font-bold flex items-center gap-1.5 text-endfield-yellow">
          <span className="w-1.5 h-1.5 rounded-full bg-endfield-yellow animate-pulse"></span>
          // LEEKLONG
        </span>

        {/* Center Pill Pull Indicator */}
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto hidden sm:block"></div>

        <div className="flex items-center gap-2.5 text-xs text-neutral-300">
          <i className={`fa-solid fa-wifi ${quickTiles.wifi ? 'text-endfield-yellow' : 'text-neutral-600'}`}></i>
          <i className="fa-solid fa-signal text-endfield-yellow"></i>
          <i className="fa-solid fa-battery-full text-endfield-yellow"></i>
          <span className="font-mono text-white font-bold ml-1">{clock}</span>
        </div>
      </motion.div>

      {/* 2. Desktop Home Screen */}
      <div className="flex-1 overflow-y-auto relative p-4 pb-20 bg-topo">
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center font-tech text-[10px] tracking-[0.35em] text-endfield-muted/70 pt-2 pb-4 select-none"
        >
          ENDFIELD OS // MOBILE TERMINAL
        </motion.div>

        {/* App Icons Grid with Staggered Entrance and Micro-interactions */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 sm:grid-cols-5 gap-y-4 gap-x-2"
        >
          {allApps.map(app => (
            <motion.div
              key={app.id}
              variants={appIconVariants}
              whileTap={{ scale: 0.88 }}
              onTouchStart={() => handleTouchStart(app)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onClick={() => handleAppClick(app)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors active:bg-black/10 dark:active:bg-white/10 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center bg-white dark:bg-[#1e1e1e] border border-endfield-border dark:border-neutral-700 shadow-md group-hover:border-endfield-yellow group-hover:shadow-[0_0_12px_rgba(229,254,0,0.3)] transition-all">
                <i className={`fa-solid ${app.project.icon} text-2xl text-endfield-dark dark:text-endfield-yellow`}></i>
              </div>
              <span className="text-[11px] font-tech font-medium text-endfield-dark dark:text-neutral-200 text-center line-clamp-2 leading-tight px-0.5">
                {app.project.title}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 3. Fullscreen Activity Layer with Fluid Spring Transitions */}
      <AnimatePresence>
        {activeActivity && (
          <motion.div 
            key={activeActivity.id}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="absolute inset-0 top-10 bottom-13 z-20 flex flex-col bg-white dark:bg-[#181818] shadow-2xl overflow-hidden"
          >
            {/* Activity App Bar */}
            <div className="flex-none h-12 bg-[#141414] text-white flex items-center gap-2 px-2 border-b border-white/10 shadow-md">
              <motion.button 
                whileTap={{ scale: 0.82 }}
                onClick={() => handleCloseActivity(activeActivity.id)}
                className="w-10 h-full flex items-center justify-center text-endfield-yellow active:bg-white/10 cursor-pointer"
                title="返回"
              >
                <i className="fa-solid fa-arrow-left text-base"></i>
              </motion.button>
              <span className="flex-1 min-w-0 font-tech font-bold text-sm tracking-wide truncate text-white">
                {activeActivity.project.title}
              </span>
              <span className="text-[10px] font-tech px-2.5 py-0.5 bg-endfield-yellow text-endfield-dark font-bold clip-slash-corner">
                {activeActivity.project.sector}
              </span>
            </div>

            {/* Activity Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative flex items-center justify-center min-h-[130px] bg-[#141414] overflow-hidden clip-slash-corner mb-4 shadow-lg"
              >
                <div className="absolute inset-0 bg-topo opacity-10"></div>
                <i className={`fa-solid ${activeActivity.project.icon} text-5xl text-endfield-yellow drop-shadow-[0_0_12px_rgba(229,254,0,0.4)]`}></i>
                <span className="absolute top-2.5 left-2.5 text-[9px] font-tech font-bold px-2 py-0.5 bg-endfield-yellow text-endfield-dark">
                  {activeActivity.project.status}
                </span>
                <span className="absolute bottom-2.5 right-2.5 text-[9px] font-tech text-white/50 tracking-wider">
                  {activeActivity.project.sector} // {activeActivity.project.tech}
                </span>
              </motion.div>

              <h2 className="text-xl font-black font-title text-endfield-dark dark:text-white mb-1.5 tracking-tight">
                {activeActivity.project.title}
              </h2>

              <div className="text-xs font-tech text-endfield-muted tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-endfield-yellow"></span>
                <span>TECH // {activeActivity.project.tech}</span>
              </div>

              <div className="flex-1 text-sm text-endfield-text dark:text-neutral-200 leading-relaxed font-sans prose prose-sm dark:prose-invert max-w-none">
                {activeActivity.isAbout ? (
                  <div className="whitespace-pre-wrap text-endfield-text dark:text-neutral-200">{activeActivity.project.full}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {activeActivity.project.full || ''}
                  </ReactMarkdown>
                )}
              </div>

              {/* Activity Bottom Action Links */}
              <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-endfield-border dark:border-neutral-800 font-tech text-xs">
                <Link 
                  to="/about" 
                  className="px-4 py-2 topo-accent-bg border border-endfield-dark text-endfield-dark font-bold flex items-center gap-1.5 hover:shadow-md transition-shadow active:scale-95"
                >
                  <i className="fa-solid fa-id-card"></i> 名片终端
                </Link>
                <Link 
                  to="/" 
                  className="px-4 py-2 bg-endfield-dark text-white font-bold flex items-center gap-1.5 hover:bg-neutral-900 transition-colors active:scale-95"
                >
                  <i className="fa-solid fa-house"></i> 返回主页
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Navigation Directory Drawer (导航目录) */}
      <AnimatePresence>
        {catalogOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCatalogOpen(false)}
            className="absolute inset-0 top-10 bottom-13 z-25 bg-black/80 backdrop-blur-md flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#181818] border-t-2 border-endfield-yellow rounded-t-3xl p-4.5 max-h-[82vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Directory Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-tech font-bold text-sm text-endfield-yellow">
                  <i className="fa-solid fa-compass text-base"></i>
                  <span>导航目录 // NAVIGATION CATALOG</span>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setCatalogOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs hover:bg-white/20"
                >
                  <i className="fa-solid fa-xmark"></i>
                </motion.button>
              </div>

              {/* Search Bar in Catalog */}
              <div className="relative mt-3 mb-3">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400"></i>
                <input 
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="搜索路由或作战档案..."
                  className="w-full bg-[#242424] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-tech text-white placeholder-neutral-500 focus:outline-none focus:border-endfield-yellow"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Section 1: Core System Routes */}
                <div>
                  <div className="text-[10px] font-tech text-endfield-muted tracking-widest uppercase mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-endfield-yellow"></span>
                    <span>核心终端路由 CORE ROUTES</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to="/"
                      onClick={() => {
                        sfx.playBeep(600, 0.04);
                        setCatalogOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#222] border border-white/10 hover:border-endfield-yellow flex flex-col items-center gap-1.5 text-center transition-all group active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#141414] flex items-center justify-center text-endfield-yellow group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-house"></i>
                      </div>
                      <span className="font-tech font-bold text-xs text-white">个人门户</span>
                      <span className="text-[9px] font-tech text-neutral-400">/ HOME</span>
                    </Link>

                    <button
                      onClick={() => {
                        sfx.playBeep(600, 0.04);
                        setCatalogOpen(false);
                        setActiveActivityId(null);
                      }}
                      className="p-2.5 rounded-xl bg-[#222] border border-endfield-yellow/70 flex flex-col items-center gap-1.5 text-center transition-all group active:scale-95 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-endfield-yellow text-[#141414] flex items-center justify-center font-bold">
                        <i className="fa-solid fa-box-archive"></i>
                      </div>
                      <span className="font-tech font-bold text-xs text-endfield-yellow">作战档案室</span>
                      <span className="text-[9px] font-tech text-neutral-400">/ ARCHIVE (当前)</span>
                    </button>

                    <Link
                      to="/about"
                      onClick={() => {
                        sfx.playBeep(600, 0.04);
                        setCatalogOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#222] border border-white/10 hover:border-endfield-yellow flex flex-col items-center gap-1.5 text-center transition-all group active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#141414] flex items-center justify-center text-endfield-yellow group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-id-card"></i>
                      </div>
                      <span className="font-tech font-bold text-xs text-white">名片终端</span>
                      <span className="text-[9px] font-tech text-neutral-400">/ ABOUT</span>
                    </Link>
                  </div>
                </div>

                {/* Section 2: Archive Posts & Documents Catalog */}
                <div>
                  <div className="text-[10px] font-tech text-endfield-muted tracking-widest uppercase mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-endfield-yellow"></span>
                      <span>作战档案目录 ARCHIVE DOCUMENTS</span>
                    </span>
                    <span>{filteredApps.length} 篇</span>
                  </div>

                  <div className="space-y-1.5">
                    {filteredApps.map(app => (
                      <motion.div
                        key={app.id}
                        whileTap={{ scale: 0.98, x: 2 }}
                        onClick={() => handleOpenApp(app)}
                        className="p-2.5 rounded-xl bg-[#222] border border-white/5 hover:border-endfield-yellow flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#141414] border border-white/10 text-endfield-yellow flex items-center justify-center text-base shrink-0">
                          <i className={`fa-solid ${app.project.icon}`}></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-tech font-bold text-xs text-white truncate flex items-center gap-2">
                            <span>{app.project.title}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-white/10 text-endfield-yellow rounded">
                              {app.project.sector}
                            </span>
                          </div>
                          <div className="text-[10px] font-tech text-neutral-400 truncate mt-0.5">
                            {app.project.desc}
                          </div>
                        </div>
                        <i className="fa-solid fa-angle-right text-xs text-neutral-500 shrink-0"></i>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Quick External Links */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-tech text-neutral-400">
                  <a 
                    href="https://github.com/LeeKLong" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 hover:text-endfield-yellow transition-colors"
                  >
                    <i className="fa-brands fa-github text-sm"></i>
                    <span>GITHUB @LeeKLong</span>
                  </a>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 text-endfield-yellow hover:underline cursor-pointer"
                  >
                    <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                    <span>{isDark ? '切换浅色' : '切换深色'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Quick Settings & Notification Curtain Shade */}
      <AnimatePresence>
        {shadeOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShadeOpen(false)}
            className="absolute inset-0 top-10 bottom-13 z-35 bg-black/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border-b-2 border-endfield-yellow p-4 space-y-4 shadow-2xl rounded-b-2xl"
            >
              {/* Quick Tiles Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    isDark ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className={`fa-solid ${isDark ? 'fa-sun text-lg' : 'fa-moon text-lg'}`}></i>
                  <span className="text-[10px]">深色模式</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleSfxTile}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    sfxEnabled ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className={`fa-solid ${sfxEnabled ? 'fa-volume-high text-lg' : 'fa-volume-xmark text-lg'}`}></i>
                  <span className="text-[10px]">音效</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleTile('wifi')}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    quickTiles.wifi ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className="fa-solid fa-wifi text-lg"></i>
                  <span className="text-[10px]">WLAN</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleTile('bt')}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    quickTiles.bt ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className="fa-solid fa-bluetooth-b text-lg"></i>
                  <span className="text-[10px]">蓝牙</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleTile('torch')}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    quickTiles.torch ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className="fa-solid fa-bolt text-lg"></i>
                  <span className="text-[10px]">手电筒</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleTile('plane')}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    quickTiles.plane ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className="fa-solid fa-plane text-lg"></i>
                  <span className="text-[10px]">飞行模式</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggleTile('loc')}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech transition-all cursor-pointer ${
                    quickTiles.loc ? 'bg-endfield-yellow text-[#141414] font-bold shadow-lg' : 'bg-[#262626] text-white/80 border border-white/10'
                  }`}
                >
                  <i className="fa-solid fa-location-crosshairs text-lg"></i>
                  <span className="text-[10px]">定位</span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.location.reload()}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-tech bg-[#262626] text-white/80 border border-white/10 active:bg-neutral-700 cursor-pointer"
                >
                  <i className="fa-solid fa-rotate-right text-lg text-endfield-yellow"></i>
                  <span className="text-[10px]">刷新终端</span>
                </motion.button>
              </div>

              {/* Notifications */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="text-[10px] font-tech text-endfield-muted flex items-center justify-between">
                  <span>// 系统通知 NOTIFICATIONS</span>
                  <span className="text-endfield-yellow font-bold">{notifications.length} 条</span>
                </div>

                {notifications.map(n => (
                  <div key={n.id} className="bg-white/5 border-l-2 border-endfield-yellow p-3 rounded-r-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold text-endfield-yellow font-tech">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-white/40">{n.time}</span>
                    </div>
                    <div className="text-xs text-neutral-300 font-sans">{n.desc}</div>
                  </div>
                ))}

                {notifications.length > 0 && (
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setNotifications([])}
                    className="w-full py-2 text-center text-[11px] font-tech text-white/60 hover:text-white border border-white/10 rounded-xl cursor-pointer"
                  >
                    清除全部通知
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Long Press Action Bottom Sheet */}
      <AnimatePresence>
        {sheetData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheetData(null)}
            className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#1e1e1e] border-t-2 border-endfield-yellow rounded-t-3xl p-5 space-y-2.5 shadow-2xl"
            >
              <div className="flex items-center gap-3.5 pb-3 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[#141414] text-endfield-yellow flex items-center justify-center text-xl shadow-md">
                  <i className={`fa-solid ${sheetData.project.icon}`}></i>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-base text-white font-tech truncate">{sheetData.project.title}</div>
                  <div className="text-[11px] font-tech text-white/50">{sheetData.project.sector} // {sheetData.project.status}</div>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.97, x: 4 }}
                onClick={() => handleOpenApp(sheetData)}
                className="w-full flex items-center gap-3.5 p-3.5 text-sm font-tech text-white active:bg-white/10 rounded-xl cursor-pointer"
              >
                <i className="fa-solid fa-play text-endfield-yellow w-5 text-center text-base"></i>
                <span className="font-bold">打开应用 OPEN</span>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.97, x: 4 }}
                onClick={() => {
                  showToast(`应用详情：${sheetData.project.tech}`, 'fa-circle-info');
                  setSheetData(null);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 text-sm font-tech text-white active:bg-white/10 rounded-xl cursor-pointer"
              >
                <i className="fa-solid fa-circle-info text-endfield-yellow w-5 text-center text-base"></i>
                <span>应用信息 INFO</span>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.97, x: 4 }}
                onClick={() => {
                  showToast('模拟操作：系统预置档案不可删除', 'fa-shield-halved');
                  setSheetData(null);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 text-sm font-tech text-white/70 active:bg-white/10 rounded-xl cursor-pointer"
              >
                <i className="fa-solid fa-trash-can text-red-400 w-5 text-center text-base"></i>
                <span>卸载（模拟）</span>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setSheetData(null)}
                className="w-full py-3.5 bg-white/10 text-white text-xs font-tech rounded-2xl text-center cursor-pointer mt-3 font-bold"
              >
                取消 CANCEL
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Toast Floating Pill with Spring Pop */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ y: 30, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-45 bg-[#141414]/95 border-2 border-endfield-yellow text-white px-5 py-2.5 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center gap-2.5 font-tech text-xs pointer-events-none"
          >
            <i className={`fa-solid ${toastMsg.icon} text-endfield-yellow text-sm`}></i>
            <span className="font-bold tracking-wide">{toastMsg.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Bottom 3-Key Navigation Bar (Back / Home / Catalog) */}
      <div className="flex-none h-13 bg-[#101010]/95 border-t border-endfield-yellow/40 flex items-center justify-around px-4 z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.4)]">
        {/* 1. Back Key */}
        <motion.button 
          whileTap={{ scale: 0.72, y: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          onClick={handleBack}
          className="w-16 h-full flex items-center justify-center text-endfield-yellow text-lg cursor-pointer"
          title="返回"
        >
          <i className="fa-solid fa-arrow-left-long"></i>
        </motion.button>

        {/* 2. Home Key */}
        <motion.button 
          whileTap={{ scale: 0.72, y: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          onClick={handleHome}
          className="w-16 h-full flex items-center justify-center text-endfield-yellow text-lg cursor-pointer"
          title="主页"
        >
          <i className="fa-solid fa-house"></i>
        </motion.button>

        {/* 3. Catalog / Navigation Menu Key */}
        <motion.button 
          whileTap={{ scale: 0.72, y: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          onClick={handleToggleCatalog}
          className={`w-16 h-full flex items-center justify-center text-lg cursor-pointer transition-colors ${
            catalogOpen ? 'text-white drop-shadow-[0_0_8px_rgba(229,254,0,0.8)]' : 'text-endfield-yellow'
          }`}
          title="导航目录"
        >
          <i className="fa-solid fa-bars-staggered"></i>
        </motion.button>
      </div>

    </div>
  );
}
