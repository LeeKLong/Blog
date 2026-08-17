interface AboutProjectsProps {
  isActive: boolean;
  onOpenModal: (title: string, desc: string) => void;
}

export default function AboutProjects({ isActive, onOpenModal }: AboutProjectsProps) {
  return (
    <div className={`tab-panel space-y-4 ${isActive ? 'block' : 'hidden'}`}>
      <div className="border-b border-endfield-border pb-3 flex justify-between items-end">
        <div>
          <div className="text-xs font-tech text-endfield-muted">// COMBAT OPERATIONS ARCHIVE</div>
          <h2 className="text-2xl font-black text-endfield-dark font-sans">作战记录与地区建设</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project 1 */}
        <div className="bg-white border border-endfield-border p-4 space-y-3 hover:shadow-xl transition-all group clip-slash-corner">
          <div className="text-[10px] font-tech text-endfield-muted flex justify-between">
            <span>[SECTOR-01]</span>
            <span className="bg-endfield-yellow text-endfield-dark font-bold px-1">ACTIVE</span>
          </div>
          <div className="h-28 bg-endfield-dark flex items-center justify-center text-endfield-yellow group-hover:scale-105 transition-transform overflow-hidden relative">
            <i className="fa-solid fa-cubes text-4xl"></i>
            <div className="absolute inset-0 bg-topo opacity-10"></div>
          </div>
          <h3 className="font-bold text-endfield-dark font-tech">3D CYBER CANVAS</h3>
          <p className="text-xs text-endfield-muted line-clamp-2">沉浸式三维空间可视化画廊，包含 WebGL 粒子风暴与交互节点。</p>
          <button 
            className="w-full py-1.5 bg-endfield-bg border border-endfield-border hover:bg-endfield-dark hover:text-white font-tech text-xs font-bold transition-all" 
            onClick={() => onOpenModal('3D CYBER CANVAS', '基于 Three.js 自定义 Shader 开发的全屏三维场景，包含百万级粒子物理模拟。')}
          >
            查看详情
          </button>
        </div>

        {/* Project 2 */}
        <div className="bg-white border border-endfield-border p-4 space-y-3 hover:shadow-xl transition-all group clip-slash-corner">
          <div className="text-[10px] font-tech text-endfield-muted flex justify-between">
            <span>[SECTOR-02]</span>
            <span className="bg-neutral-200 dark:bg-neutral-700 text-endfield-dark font-bold px-1">DEPLOYED</span>
          </div>
          <div className="h-28 bg-endfield-dark flex items-center justify-center text-neutral-300 group-hover:scale-105 transition-transform overflow-hidden relative">
            <i className="fa-solid fa-chart-line text-4xl"></i>
            <div className="absolute inset-0 bg-topo opacity-10"></div>
          </div>
          <h3 className="font-bold text-endfield-dark font-tech">ENDFIELD DASHBOARD</h3>
          <p className="text-xs text-endfield-muted line-clamp-2">高吞吐量实时数据监控面板，重构现代工程工业 UI 风格。</p>
          <button 
            className="w-full py-1.5 bg-endfield-bg border border-endfield-border hover:bg-endfield-dark hover:text-white font-tech text-xs font-bold transition-all" 
            onClick={() => onOpenModal('ENDFIELD DASHBOARD', '全响应式数据控制台，融合实时 Web Audio 音效与高对比度工程配色。')}
          >
            查看详情
          </button>
        </div>

        {/* Project 3 */}
        <div className="bg-white border border-endfield-border p-4 space-y-3 hover:shadow-xl transition-all group clip-slash-corner">
          <div className="text-[10px] font-tech text-endfield-muted flex justify-between">
            <span>[SECTOR-03]</span>
            <span className="bg-neutral-200 dark:bg-neutral-700 text-endfield-dark font-bold px-1">STAGING</span>
          </div>
          <div className="h-28 bg-endfield-dark flex items-center justify-center text-neutral-300 group-hover:scale-105 transition-transform overflow-hidden relative">
            <i className="fa-solid fa-network-wired text-4xl"></i>
            <div className="absolute inset-0 bg-topo opacity-10"></div>
          </div>
          <h3 className="font-bold text-endfield-dark font-tech">NEURAL GRAPH MAP</h3>
          <p className="text-xs text-endfield-muted line-clamp-2">知识图谱与技术栈节点可视化系统，支持节点物理拖拽与连线高亮。</p>
          <button 
            className="w-full py-1.5 bg-endfield-bg border border-endfield-border hover:bg-endfield-dark hover:text-white font-tech text-xs font-bold transition-all" 
            onClick={() => onOpenModal('NEURAL GRAPH MAP', '基于 D3.js 与 HTML5 Canvas 开发的高性能图谱渲染引擎。')}
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
