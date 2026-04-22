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
          className="absolute top-0 left-0 w-full h-full bg-[#26170c] z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center"
          style={{ transform: `translateY(${translateY})` }}
        >
          {/* Subtle horizontal lines to make it look like a roller blind fabric */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)' }}></div>
          
          {/* Curtain Bottom Weight Bar */}
          <div className="absolute bottom-0 left-0 w-full h-6 bg-[#1a0f08] border-t border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
             <div className="w-1/3 h-1 bg-white/5 rounded-full"></div>
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
        <div className={`absolute top-[-50px] ${isAr ? 'left-8 md:left-16' : 'right-8 md:right-16'} w-6 h-[70vh] z-20 pointer-events-none flex justify-center`}>
          {/* Left side of the loop (moves down) */}
          <div 
            className="w-1.5 h-full opacity-80"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #d4af37 45%, transparent 55%)',
              backgroundSize: '100% 12px',
              backgroundPosition: `0 ${progress * 800}px` 
            }}
          />
          {/* Right side of the loop (moves up) */}
          <div 
            className="w-1.5 h-full opacity-50 ml-1.5"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #d4af37 45%, transparent 55%)',
              backgroundSize: '100% 12px',
              backgroundPosition: `0 ${-progress * 800}px` 
            }}
          />
          {/* Bottom tensioner/weight */}
          <div className="absolute bottom-[-12px] w-5 h-10 border-2 border-[#d4af37] rounded-full bg-[#1a0f08] shadow-md flex items-center justify-center">
            <div className="w-1 h-4 bg-[#d4af37]/50 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
