import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../utils/sound';

interface NoticeModalProps {
  booting?: boolean;
}

export default function NoticeModal({ booting = false }: NoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasConfirmed = localStorage.getItem('endfield_notice_confirmed');
    if (!hasConfirmed && !booting) {
      // Small delay after boot screen clears for a smooth entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [booting]);

  const handleConfirm = () => {
    sfx.playBeep(980, 0.06);
    localStorage.setItem('endfield_notice_confirmed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md bg-white dark:bg-[#181818] border-2 border-endfield-dark dark:border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden clip-slash-corner"
          >
            {/* Top Hazard / Accent Strip */}
            <div className="h-1.5 bg-endfield-yellow w-full"></div>

            {/* Modal Header */}
            <div className="bg-endfield-dark text-white px-5 py-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-tech font-bold tracking-wider">
                <span className="w-2 h-2 bg-endfield-yellow inline-block animate-pulse"></span>
                <span>// 访问声明 · SYSTEM NOTICE</span>
              </div>
              <span className="text-[10px] font-tech tracking-widest text-endfield-yellow bg-endfield-yellow/10 border border-endfield-yellow/40 px-1.5 py-0.5">
                AI DEMO
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-none bg-endfield-yellow/15 border border-endfield-yellow/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fa-solid fa-triangle-exclamation text-base text-endfield-yellowDark dark:text-endfield-yellow"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-endfield-dark dark:text-white font-sans tracking-wide">
                    免责与展示声明
                  </h3>
                  <p className="text-xs text-endfield-text/80 dark:text-neutral-300 leading-relaxed font-sans">
                    由DeepSeek生成的仿终末地风格的个人Blog网站，里面的信息大部分都由ai生成，不具备参考性，仅作展示用途。
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-endfield-border/60 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-tech text-endfield-muted tracking-wider">
                  [ PROTOCOL: EXHIBITION ONLY ]
                </span>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2 topo-accent-bg border border-endfield-dark text-endfield-dark font-bold font-tech text-xs cursor-pointer hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>我已知晓</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
