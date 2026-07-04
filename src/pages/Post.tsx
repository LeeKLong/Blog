import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { getPostById } from '../utils/posts';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  
  const postData = id ? getPostById(id) : undefined;
  const rawContent = postData ? postData.body : '# 404 NOT FOUND\nFILE CORRUPTED OR MISSING.';
  
  const pageTitle = postData ? postData.attributes.title : 'Access Log';
  
  // Set dynamic document title
  useEffect(() => {
    document.title = `${pageTitle} | LEEKLONG`;
    return () => {
      document.title = 'LEEKLONG // PERSONAL ARCHIVE';
    };
  }, [pageTitle]);

  const bodyContent = rawContent;

  const [mounted, setMounted] = useState(false);
  const [scrollData, setScrollData] = useState({ progress: 0, top: -100, width: '100%', left: 0 });
  const lineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);

    const handleScroll = () => {
      if (!lineRef.current || !headerRef.current) return;
      const headerH = headerRef.current.offsetHeight;
      const lineRect = lineRef.current.getBoundingClientRect();
      
      const distToTop = lineRect.top - headerH;
      const progress = Math.max(0, Math.min(1, 1 - distToTop / 60));
      
      const initialW = lineRef.current.offsetWidth;
      const initialLeft = lineRect.left;
      
      const targetW = document.documentElement.clientWidth;
      const currentWidth = initialW + (targetW - initialW) * progress;
      const currentTop = Math.max(headerH, lineRect.top);
      
      setScrollData({
        progress,
        top: currentTop,
        width: `${currentWidth}px`,
        left: 0 // Unused now, handled by CSS transform
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 50);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#D1D1C7] font-sans selection:bg-[#E8E8E1] selection:text-[#050505] relative overflow-x-hidden">
      
      {/* 噪点与光影层 */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a24]/20 via-[#050505]/0 to-transparent"></div>

      {/* 顶部导航 - 吸顶毛玻璃 */}
      <header ref={headerRef} className={`fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-6 flex justify-between items-end backdrop-blur-xl bg-[#050505]/70 opacity-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : ''}`}>
        <div className="flex flex-col">
          <Link to="/" className="font-serif-display text-xl text-[#E8E8E1] hover-flicker cursor-pointer tracking-wide transition-colors hover:text-white">
            LEEKLONG
          </Link>
          <span className="font-mono-data text-[9px] tracking-[0.3em] text-[#666] mt-2">DOCUMENTATION</span>
        </div>
        <Link to="/" className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-2 group/btn transition-colors duration-300 font-mono-data text-[10px] tracking-widest uppercase">
          <span className="w-4 h-[1px] bg-[#555] group-hover/btn:w-8 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
          RETURN
        </Link>
      </header>

      {/* 内容区 */}
      <main className={`relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-32 pb-16 md:pt-40 md:pb-24 transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* 元信息 */}
        <div className="mb-8 pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <div className="font-mono-data text-[10px] tracking-[0.3em] text-[#555] mb-4">SYS.ARCHIVE // {id?.toUpperCase() || 'UNKNOWN'}</div>
            <h1 className="font-serif-display text-3xl md:text-5xl text-[#E8E8E1] tracking-tight">{pageTitle}</h1>
          </div>
          <div className="font-mono-data text-[10px] tracking-widest text-[#444]">
            [ STATUS: DECRYPTED ]
          </div>
        </div>

        {/* 动态滚动分割线占位符 */}
        <div ref={lineRef} className="w-full h-[1px] opacity-0 mb-16"></div>

        {/* Markdown 文章渲染区，高度定制的 Prose */}
        <article className="prose prose-invert max-w-none
          prose-headings:font-serif-display prose-headings:font-normal prose-headings:text-[#E8E8E1] prose-headings:tracking-tight
          prose-h1:text-4xl prose-h1:mb-8 prose-h1:border-b prose-h1:border-[#1a1a1a] prose-h1:pb-4
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:text-[#C8C8C1]
          prose-p:text-[#999995] prose-p:leading-relaxed prose-p:tracking-wide prose-p:font-light
          prose-a:text-[#E8E8E1] prose-a:underline-offset-4 prose-a:decoration-[#444] hover:prose-a:decoration-[#E8E8E1] prose-a:transition-colors
          prose-strong:text-[#C8C8C1] prose-strong:font-normal
          prose-ul:text-[#999995] prose-li:marker:text-[#444]
          prose-code:text-[#E8E8E1] prose-code:bg-[#111] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono-data prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-[#1a1a1a] prose-pre:shadow-2xl prose-pre:text-[#D1D1C7] prose-pre:font-mono-data
          prose-blockquote:border-l-[#333] prose-blockquote:bg-[#0a0a0c] prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:text-[#888] prose-blockquote:font-serif-display prose-blockquote:not-italic
          prose-img:rounded-sm prose-img:border prose-img:border-[#1a1a1a] prose-img:opacity-90 hover:prose-img:opacity-100 prose-img:transition-opacity
        ">
          <ReactMarkdown>{bodyContent}</ReactMarkdown>
        </article>
      </main>

      {/* 底部点缀 */}
      <footer className={`relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-12 border-t border-[#1a1a1a] opacity-0 transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : ''}`}>
        <div className="flex justify-between items-center font-mono-data text-[9px] tracking-[0.2em] text-[#444]">
          <span>© {new Date().getFullYear()} LEEKLONG</span>
          <span>END OF FILE // {id?.toUpperCase()}</span>
        </div>
      </footer>
      {/* 独立的动态线元素，移出 main 防止受到 z-10 的层叠上下文限制 */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          top: scrollData.top,
          left: '50%',
          transform: 'translateX(-50%)',
          width: scrollData.width,
          height: '1px',
          backgroundColor: scrollData.progress > 0 ? `rgba(255,255,255,${0.05 + 0.1 * scrollData.progress})` : '#1a1a1a'
        }}
      />
    </div>
  );
};

export default Post;
