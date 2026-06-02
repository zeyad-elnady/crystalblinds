"use client";

import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

export default function ModernHero({ isAr }: { isAr: boolean }) {
  return (
    <LampContainer>
      <motion.div
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 2.4,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-12 md:mt-12 flex flex-col items-center text-center w-full"
      >
        {/* Top Accent */}
        <div className="flex items-center gap-4 mb-4 md:mb-6 justify-center">
          <div className="w-10 md:w-16 h-[1px] bg-[#faf8f5]/80" />
          <span className="text-[#faf8f5] drop-shadow-md text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase z-10">
            {isAr ? "الفخامة والأناقة" : "Luxury & Elegance"}
          </span>
          <div className="w-10 md:w-16 h-[1px] bg-[#faf8f5]/80" />
        </div>

        <h1 className="bg-gradient-to-br from-[#faf8f5] to-[#d4af37] py-2 bg-clip-text text-center font-headline text-[2.2rem] sm:text-4xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-transparent leading-[1.2] md:leading-[1.1] mb-5 md:mb-6 drop-shadow-2xl">
          {isAr 
            ? <>
                كريستال للستائر
                <br />
                <span className="text-xl sm:text-2xl md:text-5xl lg:text-[4rem] text-[#e9c176] italic mt-2 block font-medium">
                  المكتبية والمنزلية
                </span>
              </>
            : <>
                Crystal Blinds
                <br />
                <span className="text-xl sm:text-2xl md:text-5xl lg:text-[4rem] text-[#e9c176] italic mt-2 block font-medium">
                  Office & Home Solutions
                </span>
              </>}
        </h1>

        <p className="font-body text-[#faf8f5]/80 text-xs sm:text-sm md:text-base max-w-[320px] sm:max-w-md md:max-w-xl leading-relaxed tracking-wide px-2 md:px-0 mb-8 md:mb-10">
          {isAr 
            ? "تركيب احترافي لجميع أنواع الستائر (ستائر رول، شرائح رأسية، زيبرا، شرائح معدنية، خشبية، بامبو، بين أسرة)"
            : "Professional installation for all types of blinds (Roller, Vertical, Zebra, Venetian, Wood, Bamboo, Cubicle Curtains)"}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-row items-center gap-3 sm:gap-4 justify-center w-full max-w-[360px] sm:max-w-none px-4 sm:px-0">
          <a 
            href="#collections" 
            className="w-1/2 sm:w-auto px-4 sm:px-8 py-3 sm:py-3.5 bg-[#d4af37] text-[#1a0f08] text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-[#e9c176] transition-colors duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-sm text-center flex items-center justify-center"
          >
            {isAr ? "اكتشف مجموعتنا" : "Discover Collections"}
          </a>
          <a 
            href="#reserve" 
            className="w-1/2 sm:w-auto group flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-3.5 border border-[#faf8f5]/30 text-[#faf8f5] text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 bg-black/10 backdrop-blur-sm rounded-sm text-center"
          >
            <span>{isAr ? "احجز زيارة" : "Book a Visit"}</span>
            <span className={`material-symbols-outlined text-[14px] sm:text-[16px] transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}>
              arrow_forward
            </span>
          </a>
        </div>
      </motion.div>
    </LampContainer>
  );
}
