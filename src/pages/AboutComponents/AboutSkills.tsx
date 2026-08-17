interface AboutSkillsProps {
  isActive: boolean;
}

export default function AboutSkills({ isActive }: AboutSkillsProps) {
  return (
    <div className={`tab-panel space-y-6 ${isActive ? 'block' : 'hidden'}`}>
      <div className="border-b border-endfield-border pb-3 flex justify-between items-end">
        <div>
          <div className="text-xs font-tech text-endfield-muted">// OPERATOR ASSESSMENT</div>
          <h2 className="text-2xl font-black text-endfield-dark font-sans">干员属性与技能专精</h2>
        </div>
        <span className="text-xs font-tech bg-endfield-yellow px-2 py-0.5 text-endfield-dark font-bold">RATING: EX</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Progress Bars */}
        <div className="space-y-4 font-tech text-xs">
          <div className="bg-white p-4 border border-endfield-border space-y-3">
            <div className="flex justify-between font-bold">
              <span>FRONTEND ARCHITECTURE (前端架构)</span>
              <span className="text-endfield-dark">95%</span>
            </div>
            <div className="w-full h-3 bg-endfield-bg border border-endfield-border p-0.5">
              <div className="h-full topo-accent-bg w-[95%]"></div>
            </div>
          </div>

          <div className="bg-white p-4 border border-endfield-border space-y-3">
            <div className="flex justify-between font-bold">
              <span>WEBGL & THREE.JS (三维图形)</span>
              <span className="text-endfield-dark">88%</span>
            </div>
            <div className="w-full h-3 bg-endfield-bg border border-endfield-border p-0.5">
              <div className="h-full bg-neutral-400 dark:bg-neutral-600 w-[88%]"></div>
            </div>
          </div>

          <div className="bg-white p-4 border border-endfield-border space-y-3">
            <div className="flex justify-between font-bold">
              <span>INTERACTIVE UI/UX (交互设计)</span>
              <span className="text-endfield-dark">92%</span>
            </div>
            <div className="w-full h-3 bg-endfield-bg border border-endfield-border p-0.5">
              <div className="h-full bg-neutral-600 dark:bg-neutral-500 w-[92%]"></div>
            </div>
          </div>
        </div>

        {/* Skill Module Chips */}
        <div className="grid grid-cols-2 gap-3 font-tech text-xs">
          <div className="p-3 bg-white border border-endfield-border hover:border-endfield-dark transition-all flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-endfield-yellow border border-endfield-dark flex items-center justify-center font-bold text-endfield-dark group-hover:scale-110 transition-transform">
              R
            </div>
            <div>
              <div className="font-bold text-endfield-dark">React / Next.js</div>
              <div className="text-[10px] text-endfield-muted">MASTER RANK</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-endfield-border hover:border-endfield-dark transition-all flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 text-endfield-dark border border-endfield-border flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              3D
            </div>
            <div>
              <div className="font-bold text-endfield-dark">Three.js / Shader</div>
              <div className="text-[10px] text-endfield-muted">ADVANCED</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-endfield-border hover:border-endfield-dark transition-all flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-neutral-800 dark:bg-neutral-700 border border-endfield-border text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              TS
            </div>
            <div>
              <div className="font-bold text-endfield-dark">TypeScript</div>
              <div className="text-[10px] text-endfield-muted">SPECIALIST</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-endfield-border hover:border-endfield-dark transition-all flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 border border-endfield-border flex items-center justify-center font-bold text-endfield-dark group-hover:scale-110 transition-transform">
              TW
            </div>
            <div>
              <div className="font-bold text-endfield-dark">Tailwind CSS</div>
              <div className="text-[10px] text-endfield-muted">EXPERT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
