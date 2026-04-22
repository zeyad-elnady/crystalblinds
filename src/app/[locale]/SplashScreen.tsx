"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Artificial delay to ensure user sees the premium splash
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2000); // Wait 2s before starting to hide

    const timer2 = setTimeout(() => {
      setLoading(false);
    }, 2800); // Wait 800ms for the exit animation to complete before unmounting

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#26170c] transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] ${
        fadeOut ? "-translate-y-full opacity-0 shadow-none" : "translate-y-0 opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      }`}
    >
      {/* Decorative subtle fabric pattern background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)' }}
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <img 
          src="/logo.png" 
          alt="Crystal Blinds" 
          className="h-28 md:h-40 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] animate-pulse duration-[2000ms]" 
        />
        
        {/* Loading Progress Bar */}
        <div className="mt-16 w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#d4af37] w-full origin-left animate-[loadingBar_2s_ease-in-out_forwards]"
          />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
