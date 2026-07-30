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
    <section id="before-after" className="py-12 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-6xl mx-auto bg-[#F5EFE6] rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-stretch border border-[#3E2723]/10">
        
        {/* Left Info Column */}
        <div className="md:w-[35%] p-8 md:p-12 flex flex-col justify-center items-start text-right" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#3E2723] mb-3">
            {isAr ? "قبل و بعد" : "Before & After"}
          </h2>
          <p className="text-[#3E2723]/80 font-light text-sm mb-6 leading-relaxed">
            {isAr
              ? "شاهد الفرق الذي تحدثه ستائر كريستال"
              : "Witness the difference made by Crystal Blinds"}
          </p>
          <a
            href="#portfolio"
            className="bg-[#2B1B17] hover:bg-[#3E2723] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md inline-block"
          >
            {isAr ? "المزيد من الصور" : "More Images"}
          </a>
        </div>

        {/* Right Slider Column */}
        <div
          ref={containerRef}
          className="md:w-[65%] min-h-[350px] md:min-h-full relative overflow-hidden select-none cursor-ew-resize"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* Before Image (Background) */}
          <div className="absolute inset-0 w-full h-full bg-black/5">
            <img
              src="/photos for crystal/before.jpg.jpeg"
              alt="Before"
              className="w-full h-full object-contain pointer-events-none"
            />
            {/* Label */}
            <span className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-20 bg-black/60 text-white px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider backdrop-blur-sm`}>
              {isAr ? "قبل" : "BEFORE"}
            </span>
          </div>

          {/* After Image (Foreground, clipped) */}
          <div
            className="absolute inset-0 w-full h-full z-10 overflow-hidden bg-black/5"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <img
              src="/photos for crystal/after.jpg.jpeg"
              alt="After"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ width: containerRef.current?.getBoundingClientRect().width }}
            />
            {/* Label */}
            <span className={`absolute top-4 ${isAr ? "left-4" : "right-4"} z-20 bg-white/95 text-[#3E2723] border border-[#3E2723]/10 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider shadow`}>
              {isAr ? "بعد" : "AFTER"}
            </span>
          </div>

          {/* Slider line & handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-[2px] bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3E2723] border border-white text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
              <span className="text-[10px] font-bold select-none leading-none">&lt; &gt;</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
