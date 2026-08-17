import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Using light theme for code highlighting
import { useParams } from 'react-router-dom';
import { getPostById } from '../utils/posts';

const Post = () => {
  const { id } = useParams();
  
  const postData = id ? getPostById(id) : undefined;
  const rawContent = postData ? postData.body : '# 404 NOT FOUND\nFILE CORRUPTED OR MISSING.';
  
  const pageTitle = postData ? postData.attributes.title : 'Access Log';
  
  // Set dynamic document title
  useEffect(() => {
    document.title = `${pageTitle} | LEEKLONG`;
    return () => {
      document.title = 'LEEKLONG // ENDFIELD PORTAL';
    };
  }, [pageTitle]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, [id]);

  return (
    <div className="min-h-screen bg-topo text-endfield-text font-sans selection:bg-endfield-yellow selection:text-endfield-dark relative">
      
      {/* Main Content */}
      <main className={`relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-16 pb-24 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Meta Info Header */}
        <div className="mb-12 border-b-2 border-endfield-dark dark:border-white/20 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="font-tech text-xs tracking-widest text-endfield-muted mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-endfield-yellow inline-block animate-pulse"></span>
                SYS.ARCHIVE // {id?.toUpperCase() || 'UNKNOWN'}
              </div>
              <h1 className="font-title font-black text-3xl md:text-5xl text-endfield-dark dark:text-white tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
            <div className="font-tech text-xs tracking-widest bg-endfield-dark text-white px-3 py-1 clip-endfield-tag shrink-0">
              STATUS: DECRYPTED
            </div>
          </div>
          {postData?.attributes?.subtitle && (
            <p className="font-sans text-lg text-endfield-muted border-l-4 border-endfield-yellow pl-4">
              {postData.attributes.subtitle}
            </p>
          )}
        </div>

        {/* Markdown Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-title prose-headings:font-bold prose-headings:text-endfield-dark dark:prose-headings:text-white prose-headings:tracking-tight
          prose-h1:text-3xl prose-h1:mb-6 prose-h1:pb-2 prose-h1:border-b prose-h1:border-endfield-border dark:prose-h1:border-neutral-800
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl
          prose-p:text-endfield-text dark:prose-p:text-neutral-200 prose-p:leading-relaxed prose-p:text-[15px]
          prose-a:text-endfield-dark dark:prose-a:text-endfield-yellow prose-a:font-semibold prose-a:underline prose-a:decoration-endfield-yellow prose-a:decoration-2 hover:prose-a:bg-endfield-yellow hover:prose-a:text-endfield-dark transition-colors
          prose-strong:text-endfield-dark dark:prose-strong:text-white
          prose-ul:text-endfield-text dark:prose-ul:text-neutral-200 prose-li:marker:text-endfield-yellow
          prose-code:text-endfield-dark dark:prose-code:text-endfield-yellow prose-code:bg-endfield-bg dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-tech prose-code:text-[0.9em] prose-code:border prose-code:border-endfield-border dark:prose-code:border-neutral-700 prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-endfield-card dark:prose-pre:bg-[#181818] prose-pre:border prose-pre:border-endfield-border dark:prose-pre:border-neutral-800 prose-pre:shadow-sm prose-pre:text-endfield-text dark:prose-pre:text-neutral-200 prose-pre:font-tech prose-pre:rounded-none prose-pre:clip-slash-corner
          prose-blockquote:border-l-4 prose-blockquote:border-endfield-yellow prose-blockquote:bg-endfield-bg dark:prose-blockquote:bg-[#1a1a1a] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-endfield-muted dark:prose-blockquote:text-neutral-400 prose-blockquote:font-sans prose-blockquote:not-italic
          prose-img:border prose-img:border-endfield-border dark:prose-img:border-neutral-800 prose-img:clip-slash-corner prose-img:shadow-sm
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{rawContent}</ReactMarkdown>
        </article>
      </main>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="回到顶部"
        className="fixed bottom-8 right-8 z-40 font-tech text-xs font-bold tracking-widest text-endfield-dark hover:text-white bg-endfield-yellow hover:bg-endfield-dark border-2 border-endfield-dark px-4 py-3 transition-colors shadow-md clip-slash-corner cursor-pointer"
      >
        <i className="fas fa-arrow-up mr-2"></i> TOP
      </button>

      {/* Footer */}
      <footer className="bg-endfield-dark text-white py-6 border-t-4 border-endfield-yellow">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex justify-between items-center font-tech text-[10px] tracking-widest text-white/50">
          <span>© {new Date().getFullYear()} LEEKLONG</span>
          <span>END OF FILE // {id?.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Post;
