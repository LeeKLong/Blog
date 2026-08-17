import { useState } from 'react';
import { sfx } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';
import AboutNav from './AboutComponents/AboutNav';
import AboutOverview from './AboutComponents/AboutOverview';
import AboutSkills from './AboutComponents/AboutSkills';
import AboutProjects from './AboutComponents/AboutProjects';
import AboutContact from './AboutComponents/AboutContact';

export default function About() {
  const [activeTab, setActiveTab] = useState('tab-card');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', desc: '' });
  const [isMasked, setIsMasked] = useState(false);
  const [signature, setSignature] = useState('是否输入一些东西来证明自己存在过');
  const { isDark, toggleTheme } = useTheme();

  const toggleMask = () => {
    sfx.playBeep(850, 0.04);
    setIsMasked(!isMasked);
  };

  const openModal = (title: string, desc: string) => {
    sfx.playBeep(900, 0.05);
    setModalData({ title, desc });
    setModalOpen(true);
  };

  const closeModal = () => {
    sfx.playBeep(850, 0.04);
    setModalOpen(false);
  };

  const copyUID = () => {
    sfx.playBeep(1200, 0.05);
    navigator.clipboard.writeText('1145077480');
    alert('编号已复制');
  };

  const handleEditSignature = () => {
    sfx.playBeep(800, 0.03);
    const updated = prompt('请输入新的个人名片签名：', signature);
    if (updated !== null) {
      setSignature(updated);
      sfx.playBeep(1000, 0.05);
    }
  };

  const handleRefresh = () => {
    sfx.playBeep(800, 0.05);
    window.location.reload();
  };

  return (
    <>
      <main className="relative z-10 flex-1 w-full mx-auto p-3 sm:p-6 flex flex-col justify-center pt-20 max-w-7xl">
        {/* Central Tactical Card Frame */}
        <div className="relative bg-endfield-panel border border-endfield-border shadow-2xl overflow-hidden min-h-[580px] flex flex-col lg:flex-row">
          
          <AboutNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Right Content Stage Area */}
          <div className="relative z-10 flex-1 p-4 sm:p-8 flex flex-col justify-between overflow-hidden">
            
            <AboutOverview isActive={activeTab === 'tab-card'} onCopyUID={copyUID} isMasked={isMasked} />
            <AboutSkills isActive={activeTab === 'tab-stats'} />
            <AboutProjects isActive={activeTab === 'tab-operations'} onOpenModal={openModal} />
            <AboutContact isActive={activeTab === 'tab-contact'} />

            {/* Bottom Signature Quote Bar */}
            <div className="pt-6 border-t border-endfield-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-tech text-xs mt-6">
              <div className="flex items-center gap-2 text-endfield-muted">
                <span className="text-endfield-dark font-bold tracking-widest uppercase">ANCHOR POINT</span>
                <span>▶▶▶</span>
              </div>

              {/* Personal Quote Box with Edit Icon */}
              <div className="flex items-center gap-3 italic text-endfield-dark font-sans bg-white/60 dark:bg-white/5 px-4 py-2 border border-endfield-border rounded-sm shadow-sm">
                <span className="text-xl font-bold font-serif text-endfield-muted">“</span>
                <span className="font-medium">{signature}</span>
                <button className="text-endfield-muted hover:text-endfield-dark transition-colors cursor-pointer" title="修改名片签名" onClick={handleEditSignature}>
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>
                <span className="text-xl font-bold font-serif text-endfield-muted">”</span>
              </div>

              {/* Action Icons (Theme/Eye/Refresh) */}
              <div className="flex items-center gap-2 text-endfield-dark">
                <button 
                  className="w-8 h-8 bg-white border border-endfield-border hover:bg-endfield-dark hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title={isDark ? "切换为明亮模式" : "切换为暗黑模式"} 
                  onClick={toggleTheme}
                >
                  <i className={`fa-solid ${isDark ? 'fa-sun text-endfield-yellow' : 'fa-moon text-endfield-dark'} text-xs`}></i>
                </button>
                <button 
                  className="w-8 h-8 bg-white border border-endfield-border hover:bg-endfield-dark hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title={isMasked ? "显示敏感信息" : "隐藏敏感信息"}
                  onClick={toggleMask}
                >
                  <i className={`fa-solid ${isMasked ? 'fa-eye text-endfield-yellow' : 'fa-eye-slash text-endfield-dark'} text-xs`}></i>
                </button>
                <button className="w-8 h-8 bg-white border border-endfield-border hover:bg-endfield-dark hover:text-white flex items-center justify-center transition-all cursor-pointer" title="刷新状态" onClick={handleRefresh}>
                  <i className="fa-solid fa-rotate text-xs"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Details Modal */}
      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm items-center justify-center p-4 ${modalOpen ? 'flex' : 'hidden'}`}>
        <div className="details-modal bg-white dark:bg-[#1a1a1a] border-2 border-endfield-dark dark:border-[#2a2a2a] w-full max-w-xl p-6 space-y-4 shadow-2xl relative clip-slash-corner">
            <button onClick={closeModal} className="absolute top-4 right-4 text-endfield-dark hover:text-endfield-yellow cursor-pointer">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="text-xs font-tech text-endfield-muted">// DEPLOYMENT ANALYSIS</div>
            <h3 className="text-2xl font-black text-endfield-dark font-sans">{modalData.title}</h3>
            <p className="text-sm text-endfield-text leading-relaxed font-sans">{modalData.desc}</p>
            <div className="pt-4 border-t border-endfield-border flex justify-end">
                <button onClick={closeModal} className="px-6 py-2 topo-accent-bg border border-endfield-dark text-endfield-dark font-bold font-tech text-xs cursor-pointer">
                    ACKNOWLEDGE
                </button>
            </div>
        </div>
      </div>
    </>
  );
}

