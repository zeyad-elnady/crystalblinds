"use client";

import { useState, useEffect, useCallback } from "react";

const HERO_IMAGES = [
  "/photos for crystal/1.jpeg",
  "/photos for crystal/3.jpeg",
  "/photos for crystal/4.jpeg",
];

export default function ModernHero({ isAr }: { isAr: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#0d0705] flex flex-col justify-center items-center"
      onMouseMove={handleMouseMove}
    >

      {/* Background Images with Crossfade & Slow Zoom */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <img
            src={src}
            alt="Hero Background"
            className={`w-full h-full object-cover transition-transform duration-[12000ms] ease-out ${index === currentImageIndex ? "scale-[1.15]" : "scale-100"
              }`}
          />
        </div>
      ))}

      {/* Multi-layer overlay system for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/80 via-[#3E2723]/30 to-[#0d0705]/95 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-20 pointer-events-none" />

      {/* Animated golden light glow that follows a subtle path */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full z-20 pointer-events-none transition-all duration-[3000ms] ease-out opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #d4af37 0%, transparent 70%)",
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Floating golden particles */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-[#d4af37] rounded-full animate-[floatParticle_8s_ease-in-out_infinite]"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.3}s`,
              opacity: 0.4 + (i % 3) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Decorative corner accents */}
      <div className={`absolute top-8 left-8 z-30 pointer-events-none transition-all duration-[1500ms] delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-[#d4af37]/60 to-transparent" />
        <div className="w-[1px] h-16 md:h-24 bg-gradient-to-b from-[#d4af37]/60 to-transparent" />
      </div>
      <div className={`absolute top-8 right-8 z-30 pointer-events-none transition-all duration-[1500ms] delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="w-16 md:w-24 h-[1px] bg-gradient-to-l from-[#d4af37]/60 to-transparent ml-auto" />
        <div className="w-[1px] h-16 md:h-24 bg-gradient-to-b from-[#d4af37]/60 to-transparent ml-auto" />
      </div>
      <div className={`absolute bottom-8 left-8 z-30 pointer-events-none transition-all duration-[1500ms] delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="w-[1px] h-16 md:h-24 bg-gradient-to-t from-[#d4af37]/60 to-transparent" />
        <div className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-[#d4af37]/60 to-transparent" />
      </div>
      <div className={`absolute bottom-8 right-8 z-30 pointer-events-none transition-all duration-[1500ms] delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="w-[1px] h-16 md:h-24 bg-gradient-to-t from-[#d4af37]/60 to-transparent ml-auto" />
        <div className="w-16 md:w-24 h-[1px] bg-gradient-to-l from-[#d4af37]/60 to-transparent ml-auto" />
      </div>

      {/* Subtle horizontal gold line behind content */}
      <div className={`absolute left-0 right-0 h-[1px] z-20 pointer-events-none transition-all duration-[2000ms] delay-500 ${mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
        style={{ top: "50%", background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.15) 70%, transparent 100%)" }}
      />

      {/* Image progress dots */}
      <div className={`absolute z-30 flex gap-3 transition-all duration-1000 delay-1000 ${mounted ? "opacity-100" : "opacity-0"} ${isAr ? "left-8 md:left-12" : "right-8 md:right-12"} top-1/2 -translate-y-1/2 flex-col`}>
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImageIndex(i)}
            className={`transition-all duration-500 rounded-full ${i === currentImageIndex
              ? "w-[6px] h-8 bg-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.5)]"
              : "w-[6px] h-[6px] bg-white/30 hover:bg-[#FFFDFA]/60"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center transition-all duration-1000 ease-out transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
      >
        {/* Top diamond accent */}
        <div className={`flex items-center gap-5 mb-8 md:mb-10 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="w-12 md:w-28 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/70" />
          <div className="w-2 h-2 rotate-45 border border-[#d4af37]/70" />
          <span className="text-[#d4af37] text-[10px] md:text-xs font-semibold tracking-[0.4em] uppercase">
            {isAr ? "الفخامة والأناقة" : "Luxury & Elegance"}
          </span>
          <div className="w-2 h-2 rotate-45 border border-[#d4af37]/70" />
          <div className="w-12 md:w-28 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/70" />
        </div>

        {/* Main Headline */}
        <h1 className={`font-headline text-[#FFFDFA] font-extrabold leading-[1.15] md:leading-[1.05] mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="block text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight">
            {isAr ? "كريستال للستائر" : "Crystal Blinds"}
          </span>
        </h1>

        {/* Elegant separator */}
        <div className={`flex items-center gap-3 mb-8 transition-all duration-1000 delay-400 ${mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"}`}>
          <div className="w-8 md:w-16 h-[1px] bg-[#d4af37]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/60" />
          <div className="w-8 md:w-16 h-[1px] bg-[#d4af37]/40" />
        </div>

        {/* Subtitle */}
        <p className={`font-body text-[#FFFDFA]/70 text-sm md:text-base max-w-xl leading-[1.9] tracking-wide mb-14 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {isAr
            ? "تركيب احترافي لجميع أنواع الستائر — ستائر رول، شرائح رأسية، زيبرا، شرائح معدنية، خشبية، بامبو"
            : "Professional installation for all types of blinds — Roller, Vertical, Zebra, Venetian, Wood, Bamboo"}
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center gap-5 transition-all duration-1000 delay-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <a
            href="#collections"
            className="group relative px-10 py-4 bg-[#d4af37] text-[#3E2723] text-xs md:text-sm font-bold uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_40px_rgba(212,175,55,0.45)]"
          >
            <span className="relative z-10">{isAr ? "اكتشف مجموعتنا" : "Discover Collections"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#e9c176] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
          <a
            href="#reserve"
            className="group flex items-center gap-3 px-10 py-4 border border-[#FFFDFA]/20 text-[#FFFDFA]/90 text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:border-[#d4af37]/60 hover:text-[#d4af37] transition-all duration-500 backdrop-blur-sm bg-white/[0.03]"
          >
            <span>{isAr ? "احجز زيارة" : "Book a Visit"}</span>
            <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}>
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 transition-all duration-1000 delay-[800ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <span className="text-[#FFFDFA]/40 text-[9px] tracking-[0.35em] uppercase font-medium">
          {isAr ? "اسحب لأسفل" : "Scroll"}
        </span>
        <div className="w-[18px] h-[28px] rounded-full border border-[#FFFDFA]/25 flex items-start justify-center pt-1.5">
          <div className="w-[3px] h-[7px] rounded-full bg-[#d4af37] animate-[scrollPulse_2s_ease-in-out_infinite]" />
        </div>
      </div>


      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(6px); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translate(30px, -60px) scale(1.5); opacity: 0.3; }
          90% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
