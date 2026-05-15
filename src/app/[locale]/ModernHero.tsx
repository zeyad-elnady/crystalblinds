"use client";

import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/photos for crystal/1.jpeg",
  "/photos for crystal/3.jpeg",
  "/photos for crystal/4.jpeg",
];

export default function ModernHero({ isAr }: { isAr: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a0f08] flex flex-col justify-center items-center">
      
      {/* Background Images with Crossfade & Slow Zoom */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
            index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={src}
            alt="Hero Background"
            className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
              index === currentImageIndex ? "scale-110" : "scale-100"
            }`}
          />
        </div>
      ))}

      {/* Overlays for premium dark/gold aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#26170c]/70 via-[#26170c]/40 to-[#1a0f08]/90 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-20 pointer-events-none" />

      {/* Content */}
      <div 
        className={`relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center transition-all duration-1000 ease-out transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Top Accent */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-12 md:w-20 h-[1px] bg-[#d4af37]/60" />
          <span className="text-[#d4af37] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
            {isAr ? "الفخامة والأناقة" : "Luxury & Elegance"}
          </span>
          <div className="w-12 md:w-20 h-[1px] bg-[#d4af37]/60" />
        </div>

        {/* Main Headline */}
        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-[#faf8f5] font-extrabold leading-[1.3] md:leading-[1.1] mb-8 tracking-tight drop-shadow-2xl">
          {isAr 
            ? <>
                كريستال للستائر
                <span className="block text-3xl md:text-5xl lg:text-6xl text-[#e9c176] italic mt-4">
                  المكتبية والمنزلية
                </span>
              </>
            : <>
                Crystal Blinds
                <span className="block text-3xl md:text-5xl lg:text-6xl text-[#e9c176] italic mt-4">
                  Office & Home Solutions
                </span>
              </>}
        </h1>

        {/* Subtitle */}
        <p className="font-body text-[#faf8f5]/80 text-sm md:text-lg max-w-2xl leading-relaxed tracking-wide mb-12">
          {isAr 
            ? "تركيب احترافي لجميع أنواع الستائر (ستائر رول، شرائح رأسية، زيبرا، شرائح معدنية، خشبية، بامبو، بين أسرة)"
            : "Professional installation for all types of blinds (Roller, Vertical, Zebra, Venetian, Wood, Bamboo, Cubicle Curtains)"}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <a 
            href="#collections" 
            className="px-8 py-4 bg-[#d4af37] text-[#26170c] text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[#e9c176] transition-colors duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            {isAr ? "اكتشف مجموعتنا" : "Discover Collections"}
          </a>
          <a 
            href="#reserve" 
            className="group flex items-center gap-3 px-8 py-4 border border-[#faf8f5]/30 text-[#faf8f5] text-xs md:text-sm font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 bg-black/10 backdrop-blur-sm"
          >
            <span>{isAr ? "احجز زيارة" : "Book a Visit"}</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}>
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div 
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 text-[#faf8f5]/60 transition-all duration-1000 delay-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-[1px] h-12 md:h-16 bg-[#faf8f5]/20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#d4af37] animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
