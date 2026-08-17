import { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { getProjects, ABOUT_PROJECT } from '../../../utils/projects';
import { sfx } from '../../../utils/sound';

export default function Desktop() {
  const { dispatch } = useOS();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleOpenApp = (id: string, project: any, isAbout = false) => {
    sfx.playBeep(900, 0.05);
    dispatch({ type: 'OPEN_WINDOW', payload: { id, project, isAbout } });
    setSelectedIconId(null);
  };

  const handleIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sfx.playBeep(600, 0.02);
    setSelectedIconId(id);
    setContextMenu(null);
  };

  const handleDesktopClick = () => {
    setSelectedIconId(null);
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedIconId(null);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const projects = getProjects();
  const icons = [
    { idx: 'about', title: '关于系统', icon: ABOUT_PROJECT.icon, project: ABOUT_PROJECT, isAbout: true },
    ...projects.map(p => ({ idx: p.id, title: p.title, icon: p.icon, project: p, isAbout: false }))
  ];

  return (
    <div 
      className="absolute inset-0 w-full h-full"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Watermarks */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-3 right-4 text-endfield-muted/50 font-tech text-[10px] tracking-[0.35em]">ENDFIELD OS // v2.6</div>
        <div className="absolute bottom-3 right-4 text-endfield-muted/40 font-mono text-[10px] hidden md:block">LAT 31.2304°N · LONG 121.4737°E · GRID 84-A</div>
        <div className="absolute bottom-3 left-4 text-endfield-muted/40 font-mono text-[10px] hidden md:block">DRAG 移动窗口 · DBL-CLICK 图标打开 · RMB 桌面菜单</div>
      </div>

      {/* Snap Guides (Hidden by default, can be integrated later with window drag state) */}
      <div id="snap-guide" className="absolute inset-0 z-30 pointer-events-none hidden">
        <div id="snap-guide-left" className="hidden absolute left-2 top-2 bottom-2 w-[calc(50%-12px)] border-2 border-endfield-yellow bg-endfield-yellow/15"></div>
        <div id="snap-guide-right" className="hidden absolute right-2 top-2 bottom-2 w-[calc(50%-12px)] border-2 border-endfield-yellow bg-endfield-yellow/15"></div>
        <div id="snap-guide-top" className="hidden absolute left-2 right-2 top-2 bottom-2 border-2 border-endfield-yellow bg-endfield-yellow/10"></div>
      </div>

      {/* Icons Area */}
      <div className="absolute top-4 left-3 z-10 flex flex-col flex-wrap gap-1" style={{ height: 'calc(100% - 40px)' }}>
        {icons.map((def) => (
          <div
            key={def.idx}
            className={`w-[78px] h-[90px] flex flex-col items-center justify-start gap-1 p-1 transition-colors cursor-pointer group ${
              selectedIconId === def.idx ? 'bg-white/40 dark:bg-white/20' : 'hover:bg-white/20 dark:hover:bg-white/10'
            }`}
            onClick={(e) => handleIconClick(e, def.idx)}
            onDoubleClick={(e) => { e.stopPropagation(); handleOpenApp(def.idx, def.project, def.isAbout); }}
          >
            <div className={`w-12 h-12 flex items-center justify-center bg-white border shadow-sm transition-all ${
              selectedIconId === def.idx ? 'border-endfield-yellow shadow-md scale-105' : 'border-endfield-border group-hover:border-endfield-dark'
            }`}>
              <i className={`fa-solid ${def.icon} text-2xl text-endfield-dark group-hover:scale-110 transition-transform`}></i>
            </div>
            <div className="text-[10px] font-tech text-endfield-dark font-bold text-center leading-tight drop-shadow-sm px-0.5 line-clamp-2">
              {def.title}
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[9000] bg-white border-2 border-endfield-dark shadow-xl font-tech text-xs w-48 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 hover:bg-endfield-bg cursor-pointer text-endfield-dark" onClick={() => { window.location.reload(); }}>
            <i className="fa-solid fa-rotate-right w-5 text-center text-endfield-yellow"></i> 刷新桌面
          </div>
          <div className="w-full h-px bg-endfield-border my-1"></div>
          <div className="px-3 py-1.5 hover:bg-endfield-bg cursor-pointer text-endfield-dark" onClick={() => {
            sfx.playBeep(900, 0.05);
            projects.forEach(p => dispatch({ type: 'OPEN_WINDOW', payload: { id: p.id, project: p, isAbout: false } }));
            setContextMenu(null);
          }}>
            <i className="fa-solid fa-folder-tree w-5 text-center text-endfield-yellow"></i> 展开全部档案
          </div>
          <div className="px-3 py-1.5 hover:bg-endfield-bg cursor-pointer text-endfield-dark" onClick={() => {
            dispatch({ type: 'CLOSE_ALL_WINDOWS' });
            setContextMenu(null);
          }}>
            <i className="fa-solid fa-broom w-5 text-center text-endfield-yellow"></i> 关闭所有窗口
          </div>
          <div className="w-full h-px bg-endfield-border my-1"></div>
          <div className="px-3 py-1.5 hover:bg-endfield-bg cursor-pointer text-endfield-dark" onClick={() => {
            dispatch({ type: 'OPEN_WINDOW', payload: { id: 'about', project: ABOUT_PROJECT, isAbout: true } });
            setContextMenu(null);
          }}>
            <i className="fa-solid fa-circle-info w-5 text-center text-endfield-yellow"></i> 关于系统
          </div>
        </div>
      )}
    </div>
  );
}
