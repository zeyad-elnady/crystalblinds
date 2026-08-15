"use client";

import { useState, useEffect, useRef } from "react";

const HERO_IMAGES = [
  "/photos for crystal/hero1.jpeg",
  "/photos for crystal/hero2.jpeg",
  "/photos for crystal/hero3.jpeg"
];

export default function ModernHero({ isAr }: { isAr: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ clients: 0, meters: 0, years: 0, satisfaction: 0 });
  const [bgIndex, setBgIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Slideshow interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Animate counters when stats bar scrolls into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const targets = { clients: 5000, meters: 12000, years: 5, satisfaction: 98 };
          const duration = 5000; // 5 seconds for much slower, elegant counting
          let start: number | null = null;

          const animate = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic for a smooth, visible roll

            setCounts({
              clients: Math.round(targets.clients * ease),
              meters: Math.round(targets.meters * ease),
              years: Math.round(targets.years * ease),
              satisfaction: Math.round(targets.satisfaction * ease),
            });

            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const locale = isAr ? "ar" : "en";

  return (
    <div className="relative w-full min-h-screen bg-[#1a0f0a] flex flex-col">
      {/* ═══ BACKGROUND IMAGES SLIDESHOW ═══ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_IMAGES.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === bgIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          </div>
        ))}
      </div>

      {/* ═══ OVERLAY GRADIENTS — dark on LEFT for Arabic, dark on RIGHT for English ═══ */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isAr
            ? "linear-gradient(to right, rgba(26,15,10,0.93) 0%, rgba(26,15,10,0.82) 30%, rgba(26,15,10,0.5) 55%, rgba(26,15,10,0.15) 75%, transparent 100%)"
            : "linear-gradient(to left, rgba(26,15,10,0.93) 0%, rgba(26,15,10,0.82) 30%, rgba(26,15,10,0.5) 55%, rgba(26,15,10,0.15) 75%, transparent 100%)",
        }}
      />
      {/* Bottom fade to section below */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(26,15,10,0.9) 0%, rgba(26,15,10,0.2) 18%, transparent 35%)",
        }}
      />

      {/* ═══ HERO CONTENT ═══ */}
      <div className="relative z-20 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 pt-28 pb-40 flex justify-center lg:justify-end">
          <div
            className={`max-w-[680px] text-center transition-all duration-1000 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ direction: isAr ? "rtl" : "ltr" }}
          >
            {/* ── Small tagline ── */}
            <p
              className={`text-[#C5A059] text-[13px] md:text-[15px] font-semibold mb-5 tracking-wide transition-all duration-1000 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {isAr ? "فخامة تدوم.. وخصوصية تكتمل" : "Lasting Luxury.. Complete Privacy"}
            </p>

            {/* ── Main headline ── */}
            <h1
              className={`text-white font-extrabold leading-[1.15] mb-6 transition-all duration-1000 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              {isAr ? (
                <>
                  كريستال للستائر
                  <br />
                  نسجنا الإبداع.. لتستمتع بالاطلالة
                </>
              ) : (
                <>
                  Blinds That Reflect
                  <br />
                  Your Taste & Space
                </>
              )}
            </h1>

            {/* ── Subtitle ── */}
            <p
              className={`text-white/70 text-[14px] md:text-[16px] leading-[1.8] mb-10 max-w-[500px] mx-auto font-light transition-all duration-1000 delay-400 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {isAr
                ? "حلول متكاملة للستائر المنزلية والتجارية بخامات عالية الجودة وتركيب احترافي."
                : "Integrated solutions for residential & commercial blinds with premium materials and professional installation."}
            </p>

            {/* ── CTA Buttons ── */}
            <div
              className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Primary: Book Free Inspection */}
              <a
                href="#reserve"
                className={`inline-flex items-center gap-2.5 bg-[#3E2723] hover:bg-[#2C1D18] text-[#FFFDFA] border border-[#C5A059]/40 font-bold text-[13px] px-7 py-3.5 rounded-lg transition-colors ${
                  isAr ? "flex-row-reverse" : ""
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>{isAr ? "احجز معاينة مجانية" : "Book Free Inspection"}</span>
              </a>

              {/* Secondary: WhatsApp */}
              <a
                href="https://wa.me/201100080609"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2.5 bg-white/10 border border-white/25 hover:bg-white/15 hover:border-white/40 text-white font-bold text-[13px] px-7 py-3.5 rounded-lg transition-colors ${
                  isAr ? "flex-row-reverse" : ""
                }`}
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{isAr ? "تواصل واتساب" : "WhatsApp Us"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STATS FLOATING BAR ═══ */}
      <div
        ref={statsRef}
        className="absolute bottom-0 left-0 right-0 z-30 w-full px-6 md:px-12 lg:px-16"
        style={{ transform: "translateY(50%)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div
            className={`relative bg-[#3E2723] rounded-2xl overflow-hidden border border-[#5a3a2e] transition-all duration-1000 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Gold accent bar on the side */}
            <div
              className={`absolute top-0 bottom-0 w-[4px] bg-[#d4af37] ${
                isAr ? "right-0" : "left-0"
              }`}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-4">
              {/* Stat 1: Happy Customers */}
              <div
                className={`flex flex-col items-center justify-center py-3 sm:py-5 md:py-7 px-1 sm:px-2 md:px-4 ${
                  isAr ? "border-l" : "border-r"
                } border-[#5a3a2e]/40`}
              >
                <span className="material-symbols-outlined text-[#d4af37] text-[18px] sm:text-[22px] md:text-[26px] mb-1 sm:mb-2">
                  groups
                </span>
                <span className="text-white text-[16px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-none" dir="ltr">
                  {counts.clients.toLocaleString()}+
                </span>
                <span className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-light mt-1 sm:mt-1.5 text-center">
                  {isAr ? "عميل سعيد" : "Happy Customers"}
                </span>
              </div>

              {/* Stat 2: Meters Installed */}
              <div
                className={`flex flex-col items-center justify-center py-3 sm:py-5 md:py-7 px-1 sm:px-2 md:px-4 ${
                  isAr ? "border-l" : "border-r"
                } border-[#5a3a2e]/40`}
              >
                <span className="material-symbols-outlined text-[#d4af37] text-[18px] sm:text-[22px] md:text-[26px] mb-1 sm:mb-2">
                  architecture
                </span>
                <span className="text-white text-[16px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-none" dir="ltr">
                  {counts.meters.toLocaleString()}+
                </span>
                <span className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-light mt-1 sm:mt-1.5 text-center">
                  {isAr ? "متر ستائر منفذة" : "Meters Installed"}
                </span>
              </div>

              {/* Stat 3: Years Experience */}
              <div
                className={`flex flex-col items-center justify-center py-3 sm:py-5 md:py-7 px-1 sm:px-2 md:px-4 ${
                  isAr ? "border-l" : "border-r"
                } border-[#5a3a2e]/40`}
              >
                <span className="material-symbols-outlined text-[#d4af37] text-[18px] sm:text-[22px] md:text-[26px] mb-1 sm:mb-2">
                  workspace_premium
                </span>
                <span className="text-white text-[16px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-none" dir="ltr">
                  {counts.years}+
                </span>
                <span className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-light mt-1 sm:mt-1.5 text-center">
                  {isAr ? "سنوات خبرة" : "Years Experience"}
                </span>
              </div>

              {/* Stat 4: Satisfaction */}
              <div className="flex flex-col items-center justify-center py-3 sm:py-5 md:py-7 px-1 sm:px-2 md:px-4">
                <span className="material-symbols-outlined text-[#d4af37] text-[18px] sm:text-[22px] md:text-[26px] mb-1 sm:mb-2">
                  thumb_up
                </span>
                <span className="text-white text-[16px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-none" dir="ltr">
                  {counts.satisfaction}%
                </span>
                <span className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-light mt-1 sm:mt-1.5 text-center">
                  {isAr ? "رضا العملاء" : "Customer Satisfaction"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
