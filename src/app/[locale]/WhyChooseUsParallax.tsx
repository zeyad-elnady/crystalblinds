"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Data
const getSections = (isAr: boolean) => [
  {
    id: 1,
    title: isAr ? "الأناقة والتصميم" : "Elegance & Design",
    description: isAr
      ? "تصاميم عصرية تندمج بسلاسة مع أي ديكور داخلي لترتقي بجمال مساحتك."
      : "Modern designs that seamlessly blend with any interior, elevating the aesthetic of your space.",
    imageUrl: "/photos for crystal/1.jpeg",
    reverse: false,
  },
  {
    id: 2,
    title: isAr ? "خبرة واحترافية" : "Professional Expertise",
    description: isAr
      ? "عقود من الخبرة تضمن لك تنفيذاً وتركيباً خالياً من العيوب بواسطة فريقنا المتخصص."
      : "Decades of experience ensuring flawless execution and installation by our dedicated team.",
    imageUrl: "/photos for crystal/2.jpeg",
    reverse: true,
  },
  {
    id: 3,
    title: isAr ? "جودة استثنائية" : "Premium Quality",
    description: isAr
      ? "نختار فقط أجود الخامات، لنضمن لك المتانة والجمال الذي يدوم طويلاً."
      : "We source only the finest materials, guaranteeing durability and long-lasting beauty.",
    imageUrl: "/photos for crystal/3.jpeg",
    reverse: false,
  },
  {
    id: 4,
    title: isAr ? "حلول ذكية مخصصة" : "Smart Customization",
    description: isAr
      ? "حلول مخصصة وأنظمة تحكم متطورة لتناسب أسلوب حياتك الفريد واحتياجاتك."
      : "Tailored solutions and advanced automation to fit your unique lifestyle and needs.",
    imageUrl: "/photos for crystal/4.jpeg",
    reverse: true,
  },
];

const ParallaxSection = ({ section, isAr }: { section: any; isAr: boolean }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  const opacityContent = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  
  // For LTR: inset(0% 100% 0% 0%) means right is cut off by 100%. Unveils left to right.
  // For RTL: inset(0% 0% 0% 100%) means left is cut off by 100%. Unveils right to left.
  const clipProgress = useTransform(
    scrollYProgress,
    [0, 0.7],
    isAr ? ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"] : ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );
  
  const translateContent = useTransform(scrollYProgress, [0, 1], [-50, 0]);

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-[100vh] flex flex-col md:flex-row items-center justify-center md:justify-between md:gap-16 lg:gap-32 gap-16 py-20 max-w-7xl mx-auto px-8 md:px-12 lg:px-16 w-full",
        section.reverse ? "md:flex-row-reverse" : ""
      )}
    >
      <motion.div style={{ y: translateContent }} className="flex-1 w-full max-w-lg">
        <div className="text-5xl md:text-6xl font-headline text-[#3E2723] leading-[1.15] drop-shadow-sm">
          {section.title}
        </div>
        <motion.p
          style={{ y: translateContent }}
          className="text-[#3E2723]/80 text-lg md:text-xl mt-6 md:mt-8 leading-[1.8]"
        >
          {section.description}
        </motion.p>
      </motion.div>
      <motion.div
        style={{
          opacity: opacityContent,
          clipPath: clipProgress,
        }}
        className="relative flex-1 flex justify-center items-center w-full"
      >
        <img
          src={section.imageUrl}
          className="w-full max-w-[480px] aspect-square object-cover rounded-2xl shadow-2xl shadow-black/10"
          alt={section.title}
        />
      </motion.div>
    </div>
  );
};

export default function WhyChooseUsParallax({ isAr }: { isAr: boolean }) {
  const sections = getSections(isAr);

  return (
    <section id="collections" className="bg-[#FFFDFA] text-[#3E2723] w-full relative z-20 overflow-hidden">
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center px-6 relative pt-20">
<div className="text-center relative z-10 mt-20">
          <span className="text-[#d4af37] uppercase tracking-[0.3em] text-sm md:text-base font-semibold mb-6 block drop-shadow-sm">
            {isAr ? "لماذا نحن" : "WHY CHOOSE US"}
          </span>
          <h3 className="font-headline text-5xl md:text-7xl lg:text-[6rem] text-[#3E2723] leading-[1.1] mb-8">
            {isAr ? "اختلاف كريستال للستائر" : "The Crystal Blinds"} <br className="hidden md:block" />
            <span className="text-[#d4af37] italic font-light">{isAr ? "" : "Difference"}</span>
          </h3>
          <p className="text-[#3E2723]/70 text-lg md:text-xl max-w-2xl mx-auto leading-[1.8] pb-12">
            {isAr
              ? "نحن لا نبيع ستائر فقط، بل نصنع تجربة متكاملة من الأناقة والاحترافية لتلبي ذوقك الرفيع."
              : "We don't just sell blinds; we craft a complete experience of elegance and professionalism tailored to your refined taste."}
          </p>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-3 text-sm text-[#d4af37] tracking-widest uppercase relative z-10 animate-bounce">
          <span>{isAr ? "مرر لأسفل" : "SCROLL"}</span>
          <ArrowDown size={20} />
        </div>
      </div>
      
      <div className={cn("flex flex-col md:px-0 px-4 pb-32", isAr ? "rtl" : "ltr")}>
        {sections.map((section) => (
          <ParallaxSection key={section.id} section={section} isAr={isAr} />
        ))}
      </div>
    </section>
  );
}
