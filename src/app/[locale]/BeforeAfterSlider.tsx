"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function BeforeAfterSlider({ isAr }: { isAr: boolean }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <section id="before-after" className="py-12 px-4 sm:px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mb-2">
            {isAr ? "قبل و بعد" : "Before & After"}
          </h2>
          <p className="text-[#3E2723]/70 text-xs md:text-sm font-light max-w-md mx-auto">
            {isAr
              ? "اسحب المؤشر وشاهد الفرق الحقيقي الذي تحدثه ستائر كريستال"
              : "Drag the slider to see the difference made by Crystal Blinds"}
          </p>
        </div>

        {/* Controlled Proportional Before & After Box */}
        <div
          ref={containerRef}
          className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] max-h-[440px] rounded-2xl md:rounded-3xl overflow-hidden select-none cursor-ew-resize border border-[#3E2723]/15 shadow-md bg-[#FAF8F5] mx-auto"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
        >
          {/* 1. Before Image (Background) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/photos for crystal/before.jpg.jpeg"
              alt="Before installing blinds"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {/* Before Badge */}
            <span className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-10 bg-black/70 text-white border border-white/20 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider backdrop-blur-md shadow-md`}>
              {isAr ? "قبل" : "BEFORE"}
            </span>
          </div>

          {/* 2. After Image (Foreground, clipped cleanly with clip-path) */}
          <div
            className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src="/photos for crystal/after.jpg.jpeg"
              alt="After installing blinds"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {/* After Badge */}
            <span className={`absolute top-4 ${isAr ? "left-4" : "right-4"} z-10 bg-[#3E2723] text-white border border-[#d4af37]/40 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider shadow-md`}>
              {isAr ? "بعد" : "AFTER"}
            </span>
          </div>

          {/* 3. Slider Divider Line & Draggable Knob */}
          <div
            className="absolute top-0 bottom-0 z-30 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-75"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#3E2723] border-2 border-white text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-base text-[#d4af37]">
                compare_arrows
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
