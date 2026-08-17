import { sfx } from '../../utils/sound';

interface AboutNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AboutNav({ activeTab, onTabChange }: AboutNavProps) {
  const handleTabClick = (tab: string) => {
    sfx.playBeep(700, 0.04);
    onTabChange(tab);
  };

  return (
    <nav className="relative z-20 w-full lg:w-20 bg-endfield-bg border-b lg:border-b-0 lg:border-r border-endfield-border flex lg:flex-col items-center justify-around lg:justify-start gap-2 p-2">
      {/* Tab 1: Profile Card */}
      <button 
        className={`nav-tab relative w-12 h-12 flex items-center justify-center transition-all group ${activeTab === 'tab-card' ? 'active' : ''}`} 
        onClick={() => handleTabClick('tab-card')} 
        title="个人名片 / OVERVIEW"
      >
        <div className={`tab-indicator absolute inset-0 border clip-slash-corner transition-all ${activeTab === 'tab-card' ? 'topo-accent-bg border-endfield-dark shadow-md opacity-100' : 'bg-white border-endfield-border opacity-0 group-hover:opacity-100'}`}></div>
        <i className={`fa-solid fa-id-card relative z-10 text-xl transition-transform group-hover:scale-110 ${activeTab === 'tab-card' ? 'text-endfield-dark' : 'text-endfield-muted group-hover:text-endfield-dark'}`}></i>
      </button>

      {/* Tab 2: Operator Stats / Skills */}
      <button 
        className={`nav-tab relative w-12 h-12 flex items-center justify-center transition-all group ${activeTab === 'tab-stats' ? 'active' : ''}`} 
        onClick={() => handleTabClick('tab-stats')} 
        title="干员与技能 / SKILLS"
      >
        <div className={`tab-indicator absolute inset-0 border clip-slash-corner transition-all ${activeTab === 'tab-stats' ? 'topo-accent-bg border-endfield-dark shadow-md opacity-100' : 'bg-white border-endfield-border opacity-0 group-hover:opacity-100'}`}></div>
        <i className={`fa-solid fa-user-gear relative z-10 text-xl transition-transform group-hover:scale-110 ${activeTab === 'tab-stats' ? 'text-endfield-dark' : 'text-endfield-muted group-hover:text-endfield-dark'}`}></i>
      </button>

      {/* Tab 3: Combat Operations / Projects */}
      <button 
        className={`nav-tab relative w-12 h-12 flex items-center justify-center transition-all group ${activeTab === 'tab-operations' ? 'active' : ''}`} 
        onClick={() => handleTabClick('tab-operations')} 
        title="地区建设 / PROJECTS"
      >
        <div className={`tab-indicator absolute inset-0 border clip-slash-corner transition-all ${activeTab === 'tab-operations' ? 'topo-accent-bg border-endfield-dark shadow-md opacity-100' : 'bg-white border-endfield-border opacity-0 group-hover:opacity-100'}`}></div>
        <i className={`fa-solid fa-cubes-stacked relative z-10 text-xl transition-transform group-hover:scale-110 ${activeTab === 'tab-operations' ? 'text-endfield-dark' : 'text-endfield-muted group-hover:text-endfield-dark'}`}></i>
      </button>

      {/* Tab 4: Dispatch / Contact */}
      <button 
        className={`nav-tab relative w-12 h-12 flex items-center justify-center transition-all group ${activeTab === 'tab-contact' ? 'active' : ''}`} 
        onClick={() => handleTabClick('tab-contact')} 
        title="基建联络 / CONTACT"
      >
        <div className={`tab-indicator absolute inset-0 border clip-slash-corner transition-all ${activeTab === 'tab-contact' ? 'topo-accent-bg border-endfield-dark shadow-md opacity-100' : 'bg-white border-endfield-border opacity-0 group-hover:opacity-100'}`}></div>
        <i className={`fa-solid fa-satellite-dish relative z-10 text-xl transition-transform group-hover:scale-110 ${activeTab === 'tab-contact' ? 'text-endfield-dark' : 'text-endfield-muted group-hover:text-endfield-dark'}`}></i>
      </button>
    </nav>
  );
}
