"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#3E2723] transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        fadeOut ? "opacity-0 scale-[1.03] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative flex flex-col items-center px-6 max-w-md w-full">
        {/* Crisp Luxury Logo with Subtle Breathing */}
        <div className="relative mb-8 animate-[logoBreathe_2.5s_ease-in-out_infinite]">
          <img 
            src="/logo2.png" 
            alt="Crystal Blinds" 
            className="w-64 sm:w-80 md:w-96 max-w-[80vw] h-auto object-contain" 
            style={{ 
              filter: "brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.5))", 
              WebkitFilter: "brightness(0) invert(1) drop-shadow(0 4px 20px rgba(0,0,0,0.5))" 
            }}
          />
        </div>

        {/* Minimalist Brand Tagline */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.4em] text-[#C5A059] uppercase mb-10 opacity-90">
          Luxury Curtains & Blinds
        </p>

        {/* Ultra-Refined Minimalist Progress Bar */}
        <div className="w-48 sm:w-56 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#C5A059]/40 via-[#E5C378] to-[#C5A059] w-full origin-left animate-[luxuryProgress_1.8s_cubic-bezier(0.4,0,0.2,1)_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes logoBreathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes luxuryProgress {
          0% { transform: scaleX(0); }
          60% { transform: scaleX(0.75); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
