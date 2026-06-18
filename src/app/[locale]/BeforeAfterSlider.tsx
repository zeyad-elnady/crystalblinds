"use client";

import { useState, useRef, useEffect } from "react";

export default function BeforeAfterSlider({ isAr }: { isAr: boolean }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
  }, [isDragging]);

  return (
    <section id="before-after" className="py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "شاهد الفرق" : "SEE THE DIFFERENCE"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "قبل و بعد" : "Before & After"}
          </h2>
          <p className="text-[#3E2723]/70 font-light mt-2 max-w-lg mx-auto">
            {isAr
              ? "شاهد الفرق الجمالي والعملي الذي تضيفه ستائر كريستال على مساحتك الخاصة."
              : "Witness the aesthetic and functional transformation Crystal Blinds brings to your space."}
          </p>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Interactive Slider Container */}
        <div
          ref={containerRef}
          className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-[#3E2723]/10 shadow-[0_20px_50px_rgba(62,39,35,0.06)] select-none cursor-ew-resize"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* Before Image (Background) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/photos for crystal/4.jpeg"
              alt="Before Installation"
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* Label */}
            <span className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-20 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider backdrop-blur-sm`}>
              {isAr ? "قبل" : "BEFORE"}
            </span>
          </div>

          {/* After Image (Foreground, clipped based on slider position) */}
          <div
            className="absolute inset-0 w-full h-full z-10 overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <img
              src="/photos for crystal/3.jpeg"
              alt="After Installation"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ width: containerRef.current?.getBoundingClientRect().width }}
            />
            {/* Label */}
            <span className={`absolute top-4 ${isAr ? "left-4" : "right-4"} z-20 bg-[#d4af37]/95 text-[#3E2723] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow`}>
              {isAr ? "بعد" : "AFTER"}
            </span>
          </div>

          {/* Slider Bar & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-[3px] bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#d4af37] border-2 border-white text-[#3E2723] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-lg select-none">unfold_more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
