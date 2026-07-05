import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/posts';
import WavyLines from '../components/WavyLines';

const App = () => {
  const isFirstLoad = useRef(!sessionStorage.getItem('hasSeenIntro')).current;
  const [loading, setLoading] = useState(isFirstLoad);
  
  // Return to home has a quick fade in, first load has the slow scatter animation
  const fadeClass = !isFirstLoad 
    ? 'opacity-0 animate-fade-in' 
    : (loading ? 'opacity-0' : 'opacity-0 animate-fade-in-up');
    
  const zoomClass = !isFirstLoad ? '' : (loading ? '' : 'animate-slow-zoom');
  const [activeChannel, setActiveChannelState] = useState(() => sessionStorage.getItem('activeChannel') || 'ALL SCENES');
  
  const setActiveChannel = (channel: string) => {
    setActiveChannelState(channel);
    sessionStorage.setItem('activeChannel', channel);
  };

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('homeScroll');
    if (savedScroll) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 50); // slight delay to ensure render
    }
    const handleScroll = () => {
      sessionStorage.setItem('homeScroll', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ================= Canvas 粒子聚合与灰烬飘散动画 =================
  useEffect(() => {
    if (!loading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d') as any;
    if (!ctx) return;
    let animationFrameId: any;
    let timeoutId;
    let isActive = true;
    let particles: any[] = [];

    // 鼠标坐标跟踪 (建议 1)
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: any) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 自适应屏幕大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // 粒子类重构
    class Particle {
      originX: number;
      originY: number;
      x: number;
      y: number;
      baseSize: number;
      size: number;
      baseAlpha: number;
      vx: number;
      vy: number;
      vz: number;
      z: number;
      isScattered: boolean;
      ease: number;
      wind: number;

      constructor(x: any, y: any) {
        this.originX = x;
        this.originY = y;

        // 初始位置：在屏幕四周的随机位置
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(canvas.width, canvas.height) * (Math.random() * 0.5 + 0.5);
        this.x = canvas.width / 2 + Math.cos(angle) * radius;
        this.y = canvas.height / 2 + Math.sin(angle) * radius;

        this.baseSize = Math.random() * 1.5 + 0.5;
        this.size = this.baseSize;
        this.baseAlpha = Math.random() * 0.6 + 0.4;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0; // Z轴速度 (深度)
        this.z = 1;  // 深度比例 (1为原大小)
        this.isScattered = false; // 是否已经被鼠标划散

        // 聚合时的缓动系数，增加随机性让聚合更有层次
        this.ease = Math.random() * 0.04 + 0.015;
        this.wind = 0;
      }

      // 1. 丝滑聚合
      gather() {
        // 纯粹的 Lerp 缓动，越靠近目标速度越慢，彻底解决卡顿跳跃
        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
      }

      // 2. 呼吸与胶片颗粒感，加入鼠标磁性交互 (建议 1)
      hold() {
        if (this.isScattered) {
          this.scatter();
          return;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 60; // 鼠标影响范围

        if (distance < maxDist) {
          // 被鼠标触摸到，直接化为灰烬散开 (建议 1的进阶互动)
          this.isScattered = true;
          this.initScatter();
          // 给一点基于鼠标移动方向的初速度
          this.vx += (dx / distance) * -3;
          this.vy += (dy / distance) * -3;
        } else {
          // 缓慢恢复原位并在目标位置附近微弱扰动
          this.x += (this.originX - this.x) * this.ease + (Math.random() - 0.5) * 0.5;
          this.y += (this.originY - this.y) * this.ease + (Math.random() - 0.5) * 0.5;
        }
      }

      // 3. 初始化散开 (灰烬/流沙模式)
      initScatter() {
        // 移除爆炸力，改为微风和浮力
        this.vx = (Math.random() - 0.5) * 1.5; // 水平微弱随机
        this.vy = Math.random() * -2 - 0.5;    // 整体向上漂浮
        this.wind = Math.random() * 0.08 + 0.02; // 向右或向左的微风加速度
        if (Math.random() > 0.5) this.wind *= -1; // 风向随机，增加飘散的自然感

        // 随机 Z 轴深度变化 (建议 4)
        this.vz = (Math.random() - 0.5) * 0.03;
      }

      // 4. 灰烬飘散 (带视差景深)
      scatter() {
        this.vx += this.wind; // 施加风力
        this.vy -= 0.02;      // 持续的轻微向上浮力
        this.z += this.vz;    // 更新深度

        this.x += this.vx * this.z; // 根据深度调整移动速度，产生视差
        this.y += this.vy * this.z;

        // 根据深度和时间调整尺寸模拟 3D
        this.baseSize *= 0.97;
        this.size = Math.max(0, this.baseSize * this.z);
      }

      draw(ctx: any) {
        // 根据深度调整透明度和颜色
        let currentAlpha = this.baseAlpha;
        if (this.z < 1) {
          currentAlpha *= Math.max(0, this.z); // 远离变暗
        } else {
          currentAlpha = Math.min(1, currentAlpha * this.z); // 靠近变亮
        }

        ctx.fillStyle = `rgba(232, 232, 225, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const text = "欢迎参观";
      const fontSize = Math.min(canvas.width / 6, 120);
      ctx.font = `bold ${fontSize}px "Songti SC", "Noto Serif SC", serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const step = canvas.width > 768 ? 4 : 3;
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          const alpha = imgData.data[index + 3];
          if (alpha > 128) {
            particles.push(new Particle(x, y));
          }
        }
      }
    };

    // 时间轴控制 (加长了一点点飘散的时间，显得更从容)
    let startTime = Date.now();
    let phase = 'gathering';
    let scatterStartTime = 0;

    const animate = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      // 时间节点： 2.2s落位完成 -> 进入 holding 状态等待用户滑动
      if (elapsed > 2200 && phase === 'gathering') {
        phase = 'holding';
      }

      if (phase === 'holding') {
        // 画一个交互提示
        if (elapsed > 3500) {
          ctx.font = '12px "Courier New", Courier, monospace';
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(elapsed / 300) * 0.5 + 0.5})`;
          ctx.textAlign = "center";
          ctx.fillText("SWIPE TO UNLOCK", canvas.width / 2, canvas.height / 2 + 100);
        }

        // 统计被划散的粒子比例
        let scatteredCount = 0;
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].isScattered) scatteredCount++;
        }

        // 如果超过 20% 的粒子被划散，则触发全面崩塌
        if (scatteredCount > particles.length * 0.2) {
          phase = 'scattering';
          scatterStartTime = Date.now();
          particles.forEach(p => {
            if (!p.isScattered) {
              p.isScattered = true;
              p.initScatter();
            }
          });
        }
      } else if (phase === 'scattering') {
        // 从全面崩塌开始计时，2.5秒后进入主页
        if (Date.now() - scatterStartTime > 2500) {
          phase = 'done';
          sessionStorage.setItem('hasSeenIntro', 'true');
          setLoading(false);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (phase === 'gathering') p.gather();
        else if (phase === 'holding') p.hold();
        else if (phase === 'scattering') p.scatter();

        if (p.size > 0.1) p.draw(ctx);
      }

      if (phase !== 'done') {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    timeoutId = setTimeout(() => {
      if (!isActive) return;
      initParticles();
      animate();
    }, 100);

    window.addEventListener('resize', resizeCanvas);
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading]);
  // ============================================================

  // 自定义核心动画特效
  const customStyles = `
    @keyframes slowZoom {
      0% { transform: scale(1); }
      100% { transform: scale(1.15); }
    }
    
    @keyframes scratch {
      0%, 100% { transform: translateX(0); opacity: 0; }
      10% { transform: translateX(-15vw); opacity: 0.1; }
      11% { transform: translateX(-15vw); opacity: 0; }
      30% { transform: translateX(20vw); opacity: 0; }
      31% { transform: translateX(20vw); opacity: 0.08; }
      32% { transform: translateX(20vw); opacity: 0; }
      60% { transform: translateX(-5vw); opacity: 0; }
      61% { transform: translateX(-5vw); opacity: 0.15; }
      63% { transform: translateX(-5vw); opacity: 0; }
      80% { transform: translateX(35vw); opacity: 0.1; }
      82% { transform: translateX(35vw); opacity: 0; }
    }

    @keyframes scanlineBand {
      0% { top: -20%; opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { top: 120%; opacity: 0; }
    }

    @keyframes horizontalFlicker {
      0%, 100% { top: 0%; opacity: 0; }
      15% { top: 15%; opacity: 0.8; }
      18% { top: 15%; opacity: 0; }
      55% { top: 65%; opacity: 0; }
      60% { top: 75%; opacity: 0.7; }
      65% { top: 75%; opacity: 0; }
      85% { top: 45%; opacity: 0.5; }
      88% { top: 45%; opacity: 0; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-slow-zoom {
      animation: slowZoom 25s ease-out infinite alternate;
    }
    .animate-fade-in-up {
      animation: fadeInUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    /* Loading 页面的优雅淡出，时间延长让灰烬消失更自然 */
    .loading-container {
      transition: opacity 2s ease-out, visibility 2s ease-out;
    }
    .loading-hidden {
      opacity: 0;
      visibility: hidden;
    }

    @keyframes flicker {
      0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
      20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.3; }
    }
    .hover-flicker:hover {
      animation: flicker 2s infinite;
    }

    .group:hover .fx-scanline {
      animation: scanlineBand 1.5s linear infinite;
    }
    
    .group:hover .fx-flicker {
      animation: horizontalFlicker 2.5s infinite;
    }
    
    .group:hover .fx-scratch {
      animation: scratch 3s infinite;
    }

    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .font-serif-display {
      font-family: "Playfair Display", "Noto Serif SC", "Songti SC", serif;
    }
    .font-mono-data {
      font-family: "Courier New", Courier, monospace;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #050505; }
    ::-webkit-scrollbar-thumb { background: #222; }
  `;

  // 混合类型文章数据
  const rawPosts = getAllPosts();

  const processedPosts = rawPosts.map(post => {
    let imageUrl = post.attributes.image;
    let hasCustomImage = true;

    // 匹配 Markdown 格式图片: ![alt](url)
    const imgMatch = post.body.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    } else if (!imageUrl) {
      imageUrl = '';
      hasCustomImage = false;
    }

    return {
      id: post.attributes.id,
      date: post.attributes.date,
      type: post.attributes.type,
      title: post.attributes.title,
      subtitle: post.attributes.subtitle,
      excerpt: post.attributes.excerpt,
      status: post.attributes.status,
      url: post.attributes.url || `/post/${post.attributes.id}`,
      imageUrl,
      hasCustomImage
    };
  });

  const channels = ['ALL SCENES', 'PROJECTS', 'AI_LAB', 'LIFE_LOG'];

  const filteredPosts = activeChannel === 'ALL SCENES'
    ? processedPosts
    : processedPosts.filter(post => post.type === activeChannel);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#D1D1C7] font-sans selection:bg-[#E8E8E1] selection:text-[#0A0A0A] overflow-x-hidden">
      <style>{customStyles}</style>

      {/* ================= 粒子 Loading 界面 ================= */}
      <div className={`fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 overflow-hidden loading-container ${loading ? '' : 'loading-hidden'}`}>

        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-0 mix-blend-overlay z-10" style={{ animation: 'scratch 2s infinite' }}></div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-20"
        />

        <div className="absolute bottom-12 font-mono-data text-[10px] tracking-[0.4em] text-[#444] z-30">
          SYSTEM BOOT SEQUENCE // STANDBY
        </div>
      </div>
      {/* ======================================================= */}


      {/* ================= 核心视觉：暗角与遮幅 ================= */}
      <div className="fixed inset-0 z-[100] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,2,2,0.95)_100%)]"></div>

      <header className={`fixed top-0 left-0 right-0 h-10 md:h-12 bg-[#000] z-[110] border-b border-[#111] px-4 md:px-8 flex justify-between items-center ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.4s' : '0s' }}>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <h1 className="font-serif-display text-sm md:text-base text-[#E8E8E1] hover-flicker cursor-pointer tracking-widest leading-none">
            LEEKLONG
          </h1>
          <span className="font-mono-data text-[8px] md:text-[9px] tracking-[0.3em] text-[#666] hidden sm:block leading-none pt-0.5">
            PERSONAL ARCHIVE
          </span>
        </div>

        <div className="flex items-center justify-end flex-1 space-x-5 md:space-x-8 font-mono-data text-[8px] md:text-[9px] tracking-widest uppercase text-[#555] overflow-x-auto no-scrollbar ml-4 pl-4 md:pl-0 mask-image-fade">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`transition-colors duration-300 whitespace-nowrap h-10 md:h-12 px-1 flex items-center ${activeChannel === channel ? 'text-[#E8E8E1]' : 'hover:text-[#888]'}`}
            >
              CH:{channel}
            </button>
          ))}
        </div>
      </header>
      <div className="fixed bottom-0 left-0 right-0 h-10 md:h-12 bg-[#000] z-[110] border-t border-[#111] flex justify-between items-center px-8">
        <span className="font-mono-data text-[9px] text-[#444] tracking-[0.3em] hidden md:block" style={{ animation: 'flicker 4s infinite' }}>REC ◉ 24 FPS</span>
        <span className="font-mono-data text-[9px] text-[#444] tracking-[0.3em] hidden md:block">MASTER DIR // VARIOUS</span>
      </div>


      {/* ================= 主体内容区 ================= */}
      <div className="relative z-10 pt-32 pb-40">

        <header className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-[#050505] flex items-end pb-12 mt-12 md:mt-8">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop"
              alt="Archive Cover"
              className={`w-full h-full object-cover opacity-30 grayscale contrast-[1.2] ${zoomClass}`}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>

          <div className={`relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '0.8s' : '0s' }}>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#E8E8E1] leading-[1.1] tracking-tight">
              <span className="italic font-light text-[#888]">ABOUT</span> LEEKLONG.
            </h2>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16 relative">
          <div className="absolute left-6 md:left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#222] to-transparent hidden md:block"></div>

          {activeChannel === 'ALL SCENES' ? (
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '1s' : '0s' }}>
              {/* 左侧：巨型标识与控制台宣言 */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-12 relative">
                {/* 动态波浪线层 */}
                <div className="absolute inset-0 z-[-1] opacity-50 mix-blend-screen pointer-events-none -m-12">
                  <WavyLines interactive={false} />
                </div>
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-widest mb-6 border-l-2 border-[#E8E8E1] pl-3">
                    SYS.IDENT // OVERRIDE
                  </h3>
                  <h1 className="font-serif-display text-5xl md:text-7xl lg:text-[5.5rem] text-[#E8E8E1] tracking-tighter leading-[0.9] uppercase mix-blend-difference">
                    DIGITAL<br />CRAFTSMAN.
                  </h1>
                </div>

                <div className="relative pl-6 border-l border-dashed border-[#333] mt-4">
                  <div className="absolute top-0 left-[-4px] w-2 h-2 bg-[#E8E8E1]" style={{ animation: 'flicker 3s infinite' }}></div>
                  <div className="font-mono-data text-[#888] text-[11px] md:text-xs leading-relaxed max-w-xl space-y-4">
                    <p className="text-[#aaa]">&gt; INITIALIZING CORE PROTOCOLS...</p>
                    <p className="text-[#aaa]">&gt; STATUS: <span className="text-[#E8E8E1]">ONLINE</span></p>
                    <p className="pt-2">
                      大学牲一枚。热爱看番、音乐、交互设计，以及 旮旯干木。<br />
                    </p>
                  </div>
                </div>
              </div>

              {/* 右侧：HUD 数据化面板 */}
              <div className="lg:col-span-5 flex flex-col gap-12">
                {/* 技能矩阵 */}
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-[0.3em] mb-5">
                    [ MODULES_LOADED ]
                  </h3>
                  <div className="flex flex-col gap-2">
                    {['REACT // DOM_ENGINE', 'TAILWIND // STYLING', 'TYPESCRIPT // LOGIC', 'CANVAS // FX_RENDER', 'NODE.JS // SYS_CORE'].map((skill) => (
                      <div key={skill} className="group relative border border-[#222] bg-[#050505] p-3 hover:border-[#555] transition-colors cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-[#E8E8E1] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></div>
                        <span className="relative z-10 font-mono-data text-[10px] tracking-widest text-[#888] group-hover:text-[#050505] transition-colors duration-500">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 核心指令 */}
                <div>
                  <h3 className="font-mono-data text-[#555] text-[10px] tracking-[0.3em] mb-5">
                    [ CURRENT_DIRECTIVES ]
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4 group">
                      <span className="text-[#E8E8E1] font-mono-data text-xs mt-1">01</span>
                      <p className="font-serif-display text-[#888] group-hover:text-[#ccc] transition-colors text-sm md:text-base leading-snug">
                        Exploring the boundaries of physical interactions in web environments.
                      </p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="text-[#E8E8E1] font-mono-data text-xs mt-1">02</span>
                      <p className="font-serif-display text-[#888] group-hover:text-[#ccc] transition-colors text-sm md:text-base leading-snug">
                        Developing game-like mechanics for everyday productivity (GameLife).
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 ${fadeClass}`} style={{ animationDelay: isFirstLoad ? '1s' : '0s' }}>
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col"
                >
                  <div className="overflow-hidden relative mb-6 aspect-square w-full bg-[#050505]">
                    <div className="absolute inset-0 border border-[#111] group-hover:border-[#444] z-20 transition-colors duration-700 pointer-events-none"></div>

                    {/* ====== Hover 专属特效：横向扫描带 & 频闪划痕 & 竖向胶片划痕 ====== */}
                    <div className="absolute left-0 right-0 h-24 bg-noise mix-blend-overlay z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-scanline"></div>
                    <div className="absolute left-0 right-0 h-[1px] bg-white/40 z-30 opacity-0 group-hover:opacity-100 pointer-events-none fx-flicker"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-0 mix-blend-overlay z-30 pointer-events-none fx-scratch"></div>

                    {post.hasCustomImage ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className={`w-full h-full object-cover opacity-50 transition-all duration-[1.5s] ease-out
                          ${post.type === 'LIFE_LOG' ? 'grayscale contrast-125 group-hover:grayscale-0' : 'sepia-[.8] hue-rotate-[180deg] saturate-50 group-hover:saturate-100'} 
                          group-hover:opacity-100 group-hover:scale-[1.05]`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center bg-[#080808] opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-[1.5s] ease-out relative">
                        {/* 极简网格背景 */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <h4 className="font-serif-display text-2xl text-[#E8E8E1] mb-2 z-10">{post.title}</h4>
                        <div className="w-8 h-[1px] bg-[#444] my-2 z-10"></div>
                        <p className="font-mono-data text-[8px] text-[#888] tracking-widest uppercase z-10">{post.subtitle}</p>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-40 font-mono-data text-[9px] tracking-widest bg-black/80 text-[#E8E8E1] px-2 py-1 border border-[#333] backdrop-blur-sm">
                      {post.type}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow relative z-10">
                    <div className="font-mono-data text-[9px] tracking-[0.2em] text-[#555] mb-3 flex items-center justify-between">
                      <span>ID: {post.id}</span>
                      <span className={`flex items-center gap-1 ${post.status === 'ONLINE' ? 'text-[#a3c2a4]' : (post.status === 'EXPERIMENTAL' ? 'text-[#c2a381]' : 'text-[#666]')}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'ONLINE' ? 'bg-[#a3c2a4]' : (post.status === 'EXPERIMENTAL' ? 'bg-[#c2a381]' : 'bg-[#666]')} animate-pulse`}></span>
                        {post.status}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-xl md:text-2xl text-[#C4C4BA] mb-2 group-hover:text-[#E8E8E1] transition-colors duration-700 tracking-wide line-clamp-2">
                      {post.title}
                    </h3>

                    <div className="font-mono-data text-[9px] tracking-[0.2em] text-[#666] mb-4 uppercase">
                      {post.subtitle}
                    </div>

                    <p className="font-serif-display text-xs text-[#777] leading-relaxed mb-8 opacity-90 text-justify line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between font-mono-data text-[9px] tracking-[0.2em] mt-auto pt-4 border-t border-[#1a1a1a]">
                      <span className="text-[#444]">{post.date}</span>
                      {post.url.startsWith('http') ? (
                        <a href={post.url} target="_blank" rel="noreferrer" className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-2 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-4 h-[1px] bg-[#555] group-hover/btn:w-8 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </a>
                      ) : (
                        <Link to={post.url} className="text-[#888] hover:text-[#E8E8E1] flex items-center gap-2 group/btn transition-colors duration-300">
                          ACCESS
                          <span className="w-4 h-[1px] bg-[#555] group-hover/btn:w-8 group-hover/btn:bg-[#E8E8E1] transition-all duration-500"></span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-40 text-center font-mono-data border-t border-[#151515] pt-20 pb-12 relative z-10">
          <div className="w-[1px] h-12 bg-[#222] mx-auto mb-10"></div>
          <div className="text-[9px] text-[#444] tracking-[0.3em] space-y-3 leading-relaxed">
            <p>DESIGNED & DIRECTED BY L.K.L</p>
            <p>SYS.VER 2.0.4 / HYBRID ARCHIVE</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;