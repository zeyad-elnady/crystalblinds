"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Slide {
  src: string;
  alt: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  tagEn: string;
  tagAr: string;
}

const SLIDES: Slide[] = [
  {
    src: "/photos for crystal/ستائر رول بلاك أوت.jpeg",
    alt: "Blackout Roller Blinds",
    labelEn: "Blackout Roller Blinds",
    labelAr: "ستائر رول بلاك أوت",
    descEn: "Absolute Light & Heat Insulation",
    descAr: "عزل مطلق للضوء والحرارة",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
  {
    src: "/photos for crystal/ستائر رول صن سكرين.jpeg",
    alt: "Sunscreen Roller Blinds",
    labelEn: "Sunscreen Roller Blinds",
    labelAr: "ستائر رول صن سكرين",
    descEn: "Smart Protection & Natural Light",
    descAr: "حماية ذكية وإضاءة طبيعية",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
  {
    src: "/photos for crystal/ستائر شرائح راسيه.jpeg",
    alt: "Vertical Blinds",
    labelEn: "Vertical Blinds",
    labelAr: "ستائر شرائح رأسية",
    descEn: "Flexible Control for Wide Spaces",
    descAr: "تحكم مرن للمساحات الواسعة",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
  {
    src: "/photos for crystal/ستائر زيبرا.jpeg",
    alt: "Zebra Blinds",
    labelEn: "Zebra Blinds",
    labelAr: "ستائر زيبرا",
    descEn: "Modern Graduated Design",
    descAr: "تصميم عصري متدرج",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
  {
    src: "/photos for crystal/ستائر شرائح معدنية.jpeg",
    alt: "Metallic Blinds",
    labelEn: "Metallic/Wooden Blinds",
    labelAr: "ستائر شرائح معدنية/خشبية",
    descEn: "Durability & Luxury for Every Taste",
    descAr: "متانة وفخامة لكل ذوق",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
  {
    src: "/photos for crystal/ستائر دبل سيستم.jpeg",
    alt: "Double System Blinds",
    labelEn: "Double System Blinds",
    labelAr: "ستائر دبل سيستم",
    descEn: "Dual Intelligence & Unlimited Possibilities",
    descAr: "ذكاء مزدوج وإمكانيات غير محدودة",
    tagEn: "Explore Series",
    tagAr: "اكتشف المجموعة",
  },
];

const AUTOPLAY_MS = 5000;

export default function FabricCarousel({ isAr }: { isAr: boolean }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev" = "next") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 400);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, "next");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev");
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 40) {
      if (isAr ? delta < 0 : delta > 0) next();
      else prev();
    }
  };

  const slide = SLIDES[current];

  // Slide-in animation classes
  const imgClass = animating
    ? direction === "next"
      ? "opacity-0 scale-105"
      : "opacity-0 scale-95"
    : "opacity-100 scale-100";

  const textClass = animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0";

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Main slide layout ── */}
      <div className={`flex flex-col md:flex-row flex-1 items-stretch min-h-[300px] md:min-h-0 ${isAr ? "md:flex-row-reverse" : ""}`}>

        {/* Image pane */}
        <div className="relative w-full md:w-3/5 aspect-[4/3] md:aspect-auto overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] z-20 bg-white/10">
            <div
              key={current}
              className="h-full bg-[#d4af37]"
              style={{
                animation: paused
                  ? "none"
                  : `progressBar ${AUTOPLAY_MS}ms linear forwards`,
              }}
            />
          </div>

          <img
            key={current}
            src={slide.src}
            alt={slide.alt}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${imgClass}`}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#26170c]/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#26170c]/40 pointer-events-none" />

          {/* Slide counter */}
          <div className={`absolute bottom-4 ${isAr ? "left-4" : "right-4"} z-10 flex items-center gap-1.5`}>
            <span className="text-white/50 text-xs font-mono">
              {String(current + 1).padStart(2, "0")}
            </span>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-white/30 text-xs font-mono">
              {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Text pane */}
        <div
          className={`
            w-full md:w-2/5 flex flex-col justify-center px-6 md:px-10 py-6 md:py-8
            transition-all duration-400 ease-out ${textClass}
            ${isAr ? "text-right items-end" : "text-left items-start"}
          `}
        >
          {/* Fabric type tag */}
          <span className="text-[#d4af37]/60 text-xs uppercase tracking-[0.3em] font-semibold mb-3">
            {isAr ? "الأقمشة الفاخرة" : "Artisan Fabrics"}
          </span>

          {/* Fabric name */}
          <h4
            className={`
              font-headline text-3xl md:text-5xl text-[#e9c176] font-bold leading-tight mb-4
              transition-all duration-400 ${animating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}
            `}
          >
            {isAr ? slide.labelAr : slide.labelEn}
          </h4>

          {/* Description */}
          <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-sm mb-6">
            {isAr ? slide.descAr : slide.descEn}
          </p>

          {/* Explore link */}
          <button className="flex items-center gap-2 text-[#d4af37] font-bold text-sm md:text-base uppercase tracking-wider hover:opacity-70 transition-opacity group">
            <span>{isAr ? slide.tagAr : slide.tagEn}</span>
            <span className={`material-symbols-outlined text-base transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}>
              chevron_right
            </span>
          </button>

          {/* ── Controls ── */}
          <div className={`flex items-center gap-6 mt-8 md:mt-10 ${isAr ? "flex-row-reverse" : ""}`}>
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous fabric"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAr ? "chevron_right" : "chevron_left"}
                </span>
              </button>
              <button
                onClick={next}
                aria-label="Next fabric"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAr ? "chevron_left" : "chevron_right"}
                </span>
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "next" : "prev")}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-[#d4af37]"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global keyframe for progress bar */}
      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
