import { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { sfx } from '../../../utils/sound';
import { getProjects } from '../../../utils/projects';
import { Link } from 'react-router-dom';

export default function Taskbar() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMenuClick = () => {
    sfx.playBeep(state.startMenuOpen ? 300 : 400, 0.05);
    dispatch({ type: 'TOGGLE_START_MENU' });
  };

  const handleTaskbarItemClick = (id: string) => {
    sfx.playBeep(700, 0.03);
    const win = state.windows[id];
    if (win.minimized) {
      dispatch({ type: 'RESTORE_WINDOW', payload: id });
    } else if (win.focused) {
      dispatch({ type: 'MINIMIZE_WINDOW', payload: id });
    } else {
      dispatch({ type: 'FOCUS_WINDOW', payload: id });
    }
  };

  return (
    <footer className="flex-none z-[6000] border-t-2 border-endfield-dark bg-endfield-bg/95 backdrop-blur h-12 flex items-center gap-1 px-1.5 font-tech select-none">
      <button 
        className="h-9 w-9 flex items-center justify-center hover:bg-endfield-yellow transition-colors group cursor-pointer" 
        title="开始菜单"
        onClick={handleStartMenuClick}
      >
        <span className="grid grid-cols-2 gap-0.5">
          <span className="w-2.5 h-2.5 bg-endfield-yellow group-hover:bg-endfield-dark"></span>
          <span className="w-2.5 h-2.5 bg-endfield-dark group-hover:bg-endfield-yellow"></span>
          <span className="w-2.5 h-2.5 bg-endfield-dark group-hover:bg-endfield-yellow"></span>
          <span className="w-2.5 h-2.5 bg-endfield-yellow group-hover:bg-endfield-dark"></span>
        </span>
      </button>
      <div className="w-px h-6 bg-endfield-border hidden sm:block"></div>
      
      <div className="hidden md:flex items-center gap-1 px-1 text-[11px]">
        <Link to="/" className="task-pin border border-transparent px-2 py-1 hover:bg-white transition-colors cursor-pointer text-endfield-dark">主页</Link>
        <Link to="/about" className="task-pin border border-transparent px-2 py-1 hover:bg-white transition-colors cursor-pointer text-endfield-dark">名片</Link>
        <button 
          className="task-pin border border-transparent px-2 py-1 hover:bg-white transition-colors cursor-pointer"
          onClick={() => {
            sfx.playBeep(900, 0.05);
            getProjects().forEach(p => dispatch({ type: 'OPEN_WINDOW', payload: { id: p.id, project: p, isAbout: false } }));
          }}
        >
          全部档案
        </button>
      </div>

      <div className="flex items-center gap-1 flex-1 min-w-0 px-1 overflow-hidden">
        {/* Active Windows Buttons */}
        {Object.values(state.windows).map((win) => (
          <button
            key={win.id}
            className={`task-btn px-2.5 py-1.5 min-w-[40px] max-w-[140px] h-8 flex items-center gap-2 border text-xs truncate transition-all cursor-pointer ${
              win.focused ? 'bg-endfield-dark text-endfield-yellow border-endfield-dark' : 'bg-white border-endfield-border hover:bg-endfield-bg text-endfield-dark'
            } ${win.minimized ? 'opacity-70' : ''}`}
            onClick={() => handleTaskbarItemClick(win.id)}
          >
            <i className={`fa-solid ${win.project?.icon || 'fa-window-maximize'} ${win.focused ? 'text-endfield-yellow' : 'text-endfield-muted'}`}></i>
            <span className="truncate">{win.project?.title || 'Unknown'}</span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2.5 px-2 text-[10px] text-endfield-muted">
        <span className="font-mono text-endfield-dark dark:text-endfield-yellow cursor-pointer">{time}</span>
        <span className="hidden xl:inline text-endfield-muted">
          本网站由 <b className="text-endfield-dark dark:text-white">LEEKLONG</b> 监制，<b className="text-endfield-dark dark:text-white">DeepSeek</b> 协同智作。
        </span>
      </div>
      
      <button 
        title="显示桌面" 
        className="w-1.5 self-stretch bg-endfield-dark hover:bg-endfield-yellow transition-colors cursor-pointer"
        onClick={() => {
          sfx.playBeep(400, 0.05);
          dispatch({ type: 'TOGGLE_SHOW_DESKTOP' });
        }}
      ></button>
    </footer>
  );
}
