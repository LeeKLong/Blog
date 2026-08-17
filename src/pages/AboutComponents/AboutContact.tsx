import React, { useState } from 'react';

interface AboutContactProps {
  isActive: boolean;
}

export default function AboutContact({ isActive }: AboutContactProps) {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackVisible(true);
    setTimeout(() => {
      setFeedbackVisible(false);
    }, 3000);
  };

  return (
    <div className={`tab-panel space-y-6 ${isActive ? 'block' : 'hidden'}`}>
      <div className="border-b border-endfield-border pb-3">
        <div className="text-xs font-tech text-endfield-muted">// BASE INFRASTRUCTURE DISPATCH</div>
        <h2 className="text-2xl font-black text-endfield-dark font-sans">基建调度与联络</h2>
      </div>

      <form className="space-y-4 font-tech text-xs" onSubmit={handleSubmit}>
        <div>
          <label className="block text-endfield-muted mb-1 font-bold">// CALLSIGN / 你的称呼</label>
          <input 
            type="text" 
            required 
            placeholder="Doctor / Recruiter Name" 
            className="w-full p-3 bg-white border border-endfield-border focus:border-endfield-dark focus:bg-amber-50/20 text-endfield-dark outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-endfield-muted mb-1 font-bold">// FREQUENCY / 电子邮箱</label>
          <input 
            type="email" 
            required 
            placeholder="doctor@endfield.com" 
            className="w-full p-3 bg-white border border-endfield-border focus:border-endfield-dark focus:bg-amber-50/20 text-endfield-dark outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-endfield-muted mb-1 font-bold">// TRANSMISSION / 留言需求</label>
          <textarea 
            rows={3} 
            required 
            placeholder="Write your transmission here..." 
            className="w-full p-3 bg-white border border-endfield-border focus:border-endfield-dark focus:bg-amber-50/20 text-endfield-dark outline-none transition-all resize-none"
          ></textarea>
        </div>
        <button type="submit" className="px-8 py-3 topo-accent-bg border border-endfield-dark text-endfield-dark font-bold hover:bg-endfield-dark hover:text-white transition-all shadow-md flex items-center gap-2">
          <i className="fa-solid fa-paper-plane"></i>
          <span>发送信号 TRANSMIT SIGNAL</span>
        </button>
      </form>

      {feedbackVisible && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-endfield-dark dark:text-endfield-yellow font-tech text-xs">
          ✓ 信号发送成功，终末地终端将在短时间内与您取得联系。
        </div>
      )}
    </div>
  );
}
