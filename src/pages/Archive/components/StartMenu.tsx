import { useOS } from '../context/OSContext';
import { getProjects } from '../../../utils/projects';
import { sfx } from '../../../utils/sound';
import { Link } from 'react-router-dom';

export default function StartMenu() {
  const { dispatch } = useOS();

  return (
    <div className="fixed bottom-[52px] left-2 z-[7000] w-80 max-w-[calc(100vw-16px)] border-2 border-endfield-dark bg-white shadow-2xl overflow-hidden font-sans">
      <div className="topo-accent-bg p-4 flex items-center gap-3 clip-slash-corner">
        <div className="w-12 h-12 bg-endfield-dark flex items-center justify-center font-black text-endfield-yellow font-title text-lg shrink-0">LK</div>
        <div className="min-w-0">
          <div className="font-black text-endfield-dark font-title tracking-widest">LEEKLONG</div>
          <div className="text-[10px] font-tech text-endfield-dark/70 truncate">省厅李总队 #2569 · UID 1145077480</div>
          <div className="text-[10px] font-tech text-endfield-dark/50 truncate">PWR LV.60 · EXP LV.7 · 注册 2026/01/22</div>
        </div>
      </div>
      <div className="p-2 space-y-0.5 font-tech text-xs">
        <Link to="/" className="start-item block w-full text-left px-3 py-2 hover:bg-endfield-bg transition-colors cursor-pointer text-endfield-dark">
          <i className="fa-solid fa-house w-5 text-center text-endfield-yellow"></i> 返回主页
        </Link>
        <Link to="/about" className="start-item block w-full text-left px-3 py-2 hover:bg-endfield-bg transition-colors cursor-pointer text-endfield-dark">
          <i className="fa-solid fa-id-card w-5 text-center text-endfield-yellow"></i> 名片终端
        </Link>
        <button 
          className="start-item block w-full text-left px-3 py-2 hover:bg-endfield-bg transition-colors cursor-pointer text-endfield-dark"
          onClick={() => {
            sfx.playBeep(900, 0.05);
            getProjects().forEach(p => dispatch({ type: 'OPEN_WINDOW', payload: { id: p.id, project: p, isAbout: false } }));
            dispatch({ type: 'CLOSE_START_MENU' });
          }}
        >
          <i className="fa-solid fa-folder-open w-5 text-center text-endfield-yellow"></i> 展开全部档案
        </button>
        <button 
          className="start-item block w-full text-left px-3 py-2 hover:bg-endfield-bg transition-colors cursor-pointer text-endfield-dark"
          onClick={() => dispatch({ type: 'OPEN_WINDOW', payload: { id: 'about', isAbout: true } })}
        >
          <i className="fa-solid fa-circle-info w-5 text-center text-endfield-yellow"></i> 关于本机
        </button>
        <button 
          className="start-item block w-full text-left px-3 py-2 hover:bg-endfield-bg transition-colors cursor-pointer text-endfield-dark"
          onClick={() => dispatch({ type: 'CLOSE_ALL_WINDOWS' })}
        >
          <i className="fa-solid fa-broom w-5 text-center text-endfield-yellow"></i> 关闭所有窗口
        </button>
      </div>
      <div className="border-t border-endfield-border p-3 text-[10px] font-tech text-endfield-muted text-center">
        本网站由 <b className="text-endfield-dark">LEEKLONG</b> 监制，<b className="text-endfield-dark">DeepSeek</b> 协同智作。
      </div>
    </div>
  );
}
