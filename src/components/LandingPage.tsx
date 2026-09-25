import { useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, PlaneTakeoff, Shield, Sparkles, Map, CreditCard, Lock, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useGSAP(() => {
    // Opacity fade to replace the buggy sliding transition
    gsap.from(container.current, { opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "all" });

    // 1. Custom Smooth Circular Cursor (Optimized with quickTo)
    const cursor = document.querySelector('.custom-cursor') as HTMLElement;
    if (cursor) {
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });
      
      window.addEventListener('mousemove', (e) => {
        xTo(e.clientX - 8);
        yTo(e.clientY - 8);
      }, { passive: true });

      const interactiveElements = document.querySelectorAll('a, button, .bento-cell, .hover-target');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(cursor, { 
            scale: 3.5, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'invert(100%)',
            duration: 0.2 
          });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(cursor, { 
            scale: 1, 
            backgroundColor: '#ffffff', 
            border: 'none',
            backdropFilter: 'none',
            duration: 0.2 
          });
        });
      });
    }

    // 2. Hero Pin Effect (Stays full size while other sections slide over)
    ScrollTrigger.create({
      trigger: '.hero-container',
      start: "top top",
      endTrigger: '.marquee-section',
      end: "top top",
      pin: true,
      pinSpacing: false,
    });

    // Fade out slightly as the next section covers it (scrub: 1 for smoothness)
    gsap.to('.hero-scale-wrapper', {
      opacity: 0.4,
      ease: "none",
      scrollTrigger: {
        trigger: '.marquee-section',
        start: "top bottom",
        end: "top top",
        scrub: 1,
      }
    });

    // Hero background slight internal parallax
    gsap.to('.hero-bg-image', {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: '.marquee-section',
        start: "top bottom",
        end: "top top",
        scrub: 1,
      }
    });

    // Hero text entry
    gsap.from(".hero-text", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.3
    });

    // Marquee animation
    gsap.to(".marquee-track", {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    });

    // Sticky Stack ScrollTrigger
    if (stackRef.current) {
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.9,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 1, // Smooth interpolation
          }
        });
      });
    }

    // Bento grid reveal
    gsap.utils.toArray<HTMLElement>(".bento-cell").forEach((cell) => {
      gsap.from(cell, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cell,
          start: "top 90%",
        }
      });
    });

    // 3D Tilt for Bento Cells (Optimized)
    const bentoCells = gsap.utils.toArray<HTMLElement>(".bento-cell");
    bentoCells.forEach((cell) => {
      const inner = cell.querySelector('.bento-inner') as HTMLElement;
      if (!inner) return;

      // Ensure 3D context
      gsap.set(inner, { transformPerspective: 1000, transformStyle: "preserve-3d" });

      const rotateXTo = gsap.quickTo(inner, "rotateX", { duration: 0.4, ease: "power2.out" });
      const rotateYTo = gsap.quickTo(inner, "rotateY", { duration: 0.4, ease: "power2.out" });

      cell.addEventListener('mousemove', (e) => {
        const rect = cell.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Slightly stronger but subtle tilt (6 degrees max)
        const rotateX = gsap.utils.mapRange(0, rect.height, 6, -6, y);
        const rotateY = gsap.utils.mapRange(0, rect.width, -6, 6, x);

        rotateXTo(rotateX);
        rotateYTo(rotateY);
      }, { passive: true });

      cell.addEventListener('mouseleave', () => {
        rotateXTo(0);
        rotateYTo(0);
      });
    });
  }, { scope: container });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 0 }, ease: "power3.inOut" });
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    gsap.to(window, { duration: 1, scrollTo: 0, ease: "power3.inOut" });
  };

  const goToDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    gsap.to(container.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => setLocation('/dashboard')
    });
  };

  return (
    <main ref={container} className="relative w-full max-w-full min-h-screen bg-[#050505] text-zinc-50 cursor-none font-sans overflow-x-hidden">
      
      {/* Custom Cursor */}
      <div className="custom-cursor fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999]" />

      {/* GLOBAL Film Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9998] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03]" />

      {/* Fluid Island Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-2 py-2 bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-full w-[95%] max-w-4xl shadow-2xl">
        <div className="flex items-center">
          <a href="#" onClick={scrollToTop} className="flex items-center gap-2 pl-4 pr-6 py-2 hover:opacity-70 transition-opacity font-display">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
              <PlaneTakeoff className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold tracking-tighter text-lg">TripSheet.</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-white transition-colors">How it works</a>
            <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
        <a href="/dashboard" onClick={goToDashboard} className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:scale-[0.98] active:scale-95 transition-transform duration-300">
          Try for free
          <span className="bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </span>
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-container relative h-[100dvh] w-full z-0">
        <div className="hero-scale-wrapper relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
          
          <div className="absolute inset-0 z-0 bg-[#050505]">
            <div className="hero-bg-image absolute -top-[10%] -bottom-[10%] left-0 right-0 bg-[url('/bg-rotated.jpg')] bg-cover bg-center opacity-90 will-change-transform" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] to-transparent z-10" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center px-4 text-center">
            <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 text-xs uppercase tracking-[0.2em] font-medium text-zinc-300">
              <Sparkles className="w-3 h-3" /> 100% Client-Side Architecture
            </div>
            
            <h1 className="hero-text text-[14vw] md:text-[9rem] lg:text-[11rem] font-bold tracking-tighter leading-[0.8] max-w-7xl mx-auto font-display drop-shadow-2xl">
              Travel, <br/><span className="text-zinc-300 font-display italic">Distilled.</span>
            </h1>
            
            <p className="hero-text mt-12 text-lg md:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-sans font-light drop-shadow-lg">
              Transform chaotic flight emails and hotel confirmations into a single, beautiful timeline. No accounts. No friction.
            </p>

            <div className="hero-text mt-14 relative z-20 hover-target">
              <a href="/dashboard" onClick={goToDashboard} className="group relative inline-flex items-center justify-center bg-white text-black px-12 py-6 rounded-full text-lg font-medium tracking-wide hover:scale-[0.98] active:scale-[0.95] transition-transform duration-500 shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                <span className="flex items-center gap-4">
                  Start Building
                  <span className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* REST OF THE SITE - Textured Background sliding up over the pinned Hero */}
      <div className="relative z-10 bg-[#050505] bg-[url('/texture.jpg')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" /> {/* Slight dark overlay for contrast */}
        <div className="relative z-10">
          
          {/* Stylized Divider */}
          <div className="w-full flex items-center justify-center pt-24 pb-12 opacity-60">
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-white mx-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Infinite Marquee */}
          <section className="marquee-section py-16 overflow-hidden flex whitespace-nowrap hover-target relative z-10 bg-black/20 backdrop-blur-md border-y border-white/5">
            <div className="marquee-track flex gap-16 items-center min-w-max pr-16 text-zinc-600 text-3xl md:text-5xl font-semibold tracking-tighter uppercase font-display will-change-transform">
              <span>Client-Side Only</span> • <span>Zero Backend</span> • <span>Instant Export</span> • <span>IndexedDB Powered</span> • <span>No Login Required</span> • <span>Mobile First</span> • 
              <span>Client-Side Only</span> • <span>Zero Backend</span> • <span>Instant Export</span> • <span>IndexedDB Powered</span> • <span>No Login Required</span> • <span>Mobile First</span> • 
            </div>
          </section>

          {/* Stylized Divider */}
          <div className="w-full flex items-center justify-center py-24 opacity-60">
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-white mx-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* The Asymmetrical Bento Grid */}
          <section id="how-it-works" className="pb-32 md:pb-48 px-4 md:px-12 max-w-[1400px] mx-auto">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 font-display">How it works.</h2>
              <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-light mx-auto md:mx-0">We stripped away everything that makes travel apps annoying. What's left is pure utility.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-dense gap-6" style={{ perspective: '2000px' }}>
              <div className="bento-cell md:col-span-2 p-1 border border-white/10 rounded-[2.5rem] bg-white/5 relative group">
                <div className="bento-inner w-full h-full bg-black/60 backdrop-blur-md rounded-[calc(2.5rem-4px)] p-12 md:p-20 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] origin-center will-change-transform">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-16 text-white backdrop-blur-md">
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold mb-4 font-display">Smart Paste</h3>
                    <p className="text-zinc-400 text-lg max-w-md font-light leading-relaxed">Paste raw text from any booking confirmation. Our regex engine instantly extracts dates, times, and booking codes.</p>
                  </div>
                </div>
              </div>

              <div className="bento-cell p-1 border border-white/10 rounded-[2.5rem] bg-white/5 relative group">
                <div className="bento-inner w-full h-full bg-black/60 backdrop-blur-md rounded-[calc(2.5rem-4px)] p-12 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] origin-center will-change-transform">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-16 text-white backdrop-blur-md">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 font-display">Privacy First</h3>
                    <p className="text-zinc-400 font-light leading-relaxed">Everything lives in IndexedDB on your device. We never see your data.</p>
                  </div>
                </div>
              </div>

              <div className="bento-cell p-1 border border-white/10 rounded-[2.5rem] bg-white/5 relative group">
                <div className="bento-inner w-full h-full bg-black/60 backdrop-blur-md rounded-[calc(2.5rem-4px)] p-12 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] origin-center will-change-transform">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-16 text-white backdrop-blur-md">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 font-display">Stateless Share</h3>
                    <p className="text-zinc-400 font-light leading-relaxed">Export trips via a compressed URL hash. Share instantly without databases.</p>
                  </div>
                </div>
              </div>

              <div className="bento-cell md:col-span-2 p-1 border border-white/10 rounded-[2.5rem] bg-white/5 relative group">
                <div className="bento-inner w-full h-full bg-black/60 backdrop-blur-md rounded-[calc(2.5rem-4px)] p-12 md:p-20 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden origin-center will-change-transform">
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-overlay opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-16 text-white backdrop-blur-md">
                      <PlaneTakeoff className="w-8 h-8" />
                    </div>
                    <h3 className="text-4xl font-bold mb-4 font-display">Chronological Sorting</h3>
                    <p className="text-zinc-400 text-lg max-w-md font-light leading-relaxed">Stop scrolling through your inbox at the airport. Get a clean, day-by-day visual timeline.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stylized Divider */}
          <div className="w-full flex items-center justify-center pb-24 opacity-60">
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-white mx-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Sticky Stack Features */}
          <section id="features" ref={stackRef} className="relative w-full pb-32">
            <div className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center p-4">
              <div className="w-full max-w-6xl aspect-[4/3] md:aspect-[21/9] bg-black/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-1 flex shadow-2xl relative overflow-hidden will-change-transform">
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 w-full h-full rounded-[calc(2.5rem-4px)] p-12 md:p-24 flex flex-col justify-end pointer-events-none">
                  <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-10 text-white backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <PlaneTakeoff className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-6 font-display drop-shadow-lg">Chronological Clarity.</h2>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-xl font-light leading-relaxed">Flights, hotels, and activities sorted automatically by time. Perfect order, instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center p-4">
              <div className="w-full max-w-6xl aspect-[4/3] md:aspect-[21/9] bg-black/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-1 flex shadow-2xl relative overflow-hidden will-change-transform">
                <div className="absolute inset-0 bg-emerald-900/10 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 w-full h-full rounded-[calc(2.5rem-4px)] p-12 md:p-24 flex flex-col justify-end pointer-events-none">
                  <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-10 text-white backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <Shield className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-6 font-display drop-shadow-lg">Absolute Privacy.</h2>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-xl font-light leading-relaxed">No servers. No accounts. Your data lives strictly in your browser's local storage.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center p-4">
              <div className="w-full max-w-6xl aspect-[4/3] md:aspect-[21/9] bg-black/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-1 flex shadow-2xl relative overflow-hidden will-change-transform">
                <div className="absolute inset-0 bg-purple-900/10 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 w-full h-full rounded-[calc(2.5rem-4px)] p-12 md:p-24 flex flex-col justify-end pointer-events-none">
                  <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-10 text-white backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-6 font-display drop-shadow-lg">Instant Export.</h2>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-xl font-light leading-relaxed">Share your itinerary instantly as a compressed URL or a high-res image directly to WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stylized Divider */}
          <div className="w-full flex items-center justify-center py-24 opacity-60">
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-white mx-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="w-1/4 md:w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Pricing / CTA Section */}
          <section id="pricing" className="pb-40 px-4 flex justify-center hover-target">
            <div className="w-full max-w-5xl p-1 bg-white/5 rounded-[3rem] border border-white/10 group">
              <div className="bg-black/60 backdrop-blur-md w-full h-full rounded-[calc(3rem-4px)] p-16 md:p-32 flex flex-col items-center text-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-black/80">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-12 text-white transition-transform duration-500 group-hover:scale-110">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-display">$0. Forever.</h2>
                <p className="text-2xl text-zinc-400 max-w-2xl mb-16 font-light leading-relaxed">TripSheet is a client-side utility. Since we have zero server costs, you have zero subscription fees.</p>
                
                <a href="/dashboard" onClick={goToDashboard} className="group/btn relative inline-flex items-center justify-center bg-white text-black px-12 py-6 rounded-full text-xl font-medium tracking-wide hover:scale-[0.98] active:scale-[0.95] transition-transform duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <span className="flex items-center gap-4">
                    Start using TripSheet
                    <span className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover/btn:translate-x-2 transition-transform duration-500">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </section>

          {/* Minimalist Footer */}
          <footer className="py-16 border-t border-white/10 px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-500 text-sm font-light">
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="w-5 h-5" />
              <span className="font-medium text-zinc-300 tracking-wide font-display text-base">TripSheet MVP</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="https://github.com/your-username/tripsheet" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                View Source
              </a>
            </div>
          </footer>
        </div>
      </div>

    </main>
  );
}
