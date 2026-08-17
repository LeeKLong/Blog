import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import Home from './pages/Home';
import Post from './pages/Post';
import Archive from './pages/Archive';
import About from './pages/About';
import Header from './components/Header';
import BootScreen from './components/BootScreen';
import Crosshair from './components/Crosshair';
import TopoCanvas from './components/TopoCanvas';
import MusicPlayer from './components/MusicPlayer';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [booting, setBooting] = useState(() => {
    return !sessionStorage.getItem('endfield_booted');
  });
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleBootComplete = () => {
    sessionStorage.setItem('endfield_booted', 'true');
    setBooting(false);
  };

  // Global Scroll Reveal hook for data-reveal elements
  useEffect(() => {
    if (booting) return;
    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1
      });
    });
  }, [booting, location.pathname]);

  return (
    <>
      {booting && <BootScreen onComplete={handleBootComplete} />}
      <TopoCanvas />
      <Crosshair />
      <Header />
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:id" element={<Post />} />
      </Routes>
    </>
  );
}

function App() {
  const base = import.meta.env.BASE_URL;
  const basename = base === '/' ? '' : base;

  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

