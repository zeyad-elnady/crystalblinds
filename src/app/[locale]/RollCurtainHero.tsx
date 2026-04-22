"use client";

import { useEffect, useState } from "react";

export default function RollCurtainHero({ isAr }: { isAr: boolean }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate progress. 0 to 1 based on scrolling the first 100vh.
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const progress = Math.min(Math.max(scrollY / windowHeight, 0), 1);
  
  // The curtain rolls up. We translate it up.
  const translateY = `-${progress * 100}vh`;

  return (
    <div className="relative w-full" style={{ height: "200vh" }}>
      {/* Sticky wrapper that holds the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-surface">
        
        {/* The content revealed BEHIND the curtain */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#faf8f5] px-6 z-0">
          <div 
            className="text-center transition-all duration-1000"
            style={{ opacity: progress > 0.3 ? 1 : 0, transform: `translateY(${(1 - progress) * 50}px)` }}
          >
            <span className="material-symbols-outlined text-6xl text-[#d4af37] mb-6 block">light_mode</span>
            <h2 className="font-headline text-3xl md:text-5xl text-[#26170c] font-bold mb-4">
              {isAr ? "دع النور يدخل" : "Let The Light In"}
            </h2>
            <p className="text-[#26170c]/60 max-w-lg mx-auto font-body text-sm md:text-base">
              {isAr 
                ? "اكتشف مجموعتنا الحصرية من الستائر المصممة للتحكم الدقيق في الإضاءة والخصوصية." 
                : "Discover our exclusive collection of blinds designed for precise light and privacy control."}
            </p>
          </div>
        </div>

        {/* The 2D Curtain */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-[#26170c] z-10 flex flex-col items-center justify-center shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)]"
          style={{ 
            transform: `translateY(${translateY})`,
            backgroundImage: `
              linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.4) 100%),
              repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)
            `
          }}
        >
          {/* Curtain Bottom Weight Bar */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#1a0f08] to-[#0a0603] border-t border-[#d4af37]/20 shadow-[0_10px_20px_rgba(0,0,0,0.9)] flex items-center justify-center">
             <div className="w-1/4 h-[2px] bg-[#d4af37]/20 rounded-full"></div>
          </div>

          <div className="relative z-20 text-center px-6 mt-16">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-[1.2] md:leading-[1.1] tracking-tight">
              {isAr 
                ? <>مستقبل تغطية النوافذ:<br/>هندسة الإضاءة والخصوصية</>
                : <>The Future of Window Coverings:<br/>Engineering Light & Privacy</>}
            </h1>
            <p className="font-body text-[#d4af37] uppercase tracking-[0.15em] md:tracking-[0.25em] font-semibold text-[10px] md:text-sm max-w-2xl mx-auto mt-6">
              {isAr 
                ? "ثورة في تغطية النوافذ | ستائر وظلال عصرية" 
                : "REVOLUTIONIZING WINDOW COVERINGS | Modern Blinds & Shades"}
            </p>

            <div className="mt-16 flex flex-col items-center gap-3 animate-bounce text-[#d4af37]">
              <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold">
                {isAr ? "اسحب للأعلى لفتح الستارة" : "Scroll to open"}
              </span>
              <span className="material-symbols-outlined">straight</span>
            </div>
          </div>
        </div>

        {/* The Pull Chain (Cord) */}
        <div className={`absolute top-0 ${isAr ? 'left-3 md:left-6' : 'right-3 md:right-6'} w-5 h-[65vh] z-20 pointer-events-none flex justify-center`}>
          {/* Left side of the loop (moves down) */}
          <div 
            className="w-1 h-full opacity-90"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #b89730 45%, transparent 55%)',
              backgroundSize: '100% 8px',
              backgroundPosition: `0 ${progress * 800}px` 
            }}
          />
          {/* Right side of the loop (moves up) */}
          <div 
            className="w-1 h-full opacity-60 ml-1.5"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #b89730 45%, transparent 55%)',
              backgroundSize: '100% 8px',
              backgroundPosition: `0 ${-progress * 800}px` 
            }}
          />
          {/* Sleek metallic bottom tensioner/weight */}
          <div className="absolute bottom-[-20px] w-4 h-16 bg-gradient-to-b from-[#d4af37] via-[#8a6d3b] to-[#4a3a1f] rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.6)] border border-[#f5d97d]/40 flex flex-col items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#26170c]/40 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-[#26170c]/40 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
