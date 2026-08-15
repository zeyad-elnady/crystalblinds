import React from "react";

export default function AboutUs({ isAr }: { isAr: boolean }) {
  const items = [
    {
      titleAr: "خامات أوروبية",
      titleEn: "European Materials",
      descAr: "أعلى جودة في الخامات من ماركات أوروبية معتمدة",
      descEn: "Highest quality materials from certified European brands",
      icon: "workspace_premium"
    },
    {
      titleAr: "ضمان حقيقي",
      titleEn: "Real Warranty",
      descAr: "ضمان على الخامات والتركيب حتى 5 سنوات",
      descEn: "Warranty on materials and installation up to 5 years",
      icon: "menu_book"
    },
    {
      titleAr: "معاينة مجانية",
      titleEn: "Free Inspection",
      descAr: "نأتي إليك أينما كنت ونقدم استشارة مجانية",
      descEn: "We come to you wherever you are and offer free consultation",
      icon: "assignment"
    },
    {
      titleAr: "تركيب احترافي",
      titleEn: "Professional Installation",
      descAr: "فريق متخصص للتركيب احترافي وسريع",
      descEn: "Specialist team for quick and professional installation",
      icon: "track_changes"
    }
  ];

  const orderedItems = isAr ? [...items].reverse() : items;

  return (
    <section id="about" className="py-16 md:py-24 px-6 md:px-12 bg-[#FFFDFA] relative overflow-hidden text-[#3E2723]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title */}
        <h2 className="text-center font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mb-10">
          {isAr ? "لماذا تختار كريستال؟" : "Why Choose Crystal?"}
        </h2>

        {/* Card Row */}
        <div className="bg-white border border-[#d4af37]/30 rounded-3xl p-6 md:p-10 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {orderedItems.map((item, idx) => {
              const borderStyle = isAr
                ? (idx < orderedItems.length - 1 ? "md:border-l border-[#3E2723]/10" : "")
                : (idx < orderedItems.length - 1 ? "md:border-r border-[#3E2723]/10" : "");

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center text-center p-4 ${borderStyle}`}
                >
                  {/* Gold Circle Icon */}
                  <div className="w-12 h-12 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] bg-[#fdfbf7] mb-4">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm md:text-base text-[#2B1B17] mb-2">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs text-[#3E2723]/70 font-light leading-relaxed max-w-[200px]">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Founder Section */}
        <div className="relative bg-[#3E2723] rounded-3xl p-8 md:p-16 overflow-hidden border border-[#d4af37]/30">
          {/* Decorative quote icon background */}
          <div className={`absolute top-6 ${isAr ? "left-8" : "right-8"} text-white/5 pointer-events-none select-none`}>
            <span className="material-symbols-outlined text-[120px] md:text-[200px] font-bold">format_quote</span>
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full" style={{ direction: isAr ? "rtl" : "ltr" }}>
            <span className="material-symbols-outlined text-4xl text-[#d4af37] mb-6 block opacity-85">format_quote</span>
            
            <blockquote className={`text-lg md:text-2xl font-light leading-relaxed text-white/95 mb-8 max-w-4xl ${isAr ? "text-right" : "text-left"}`}>
              {isAr 
                ? "« في كريستال للستائر، نحن لا نغطي الشبابيك.. نحن نحمي خصوصيتك، ونرسم ملامح مكتبك. كل ستارة نركبها هي توقيع شخصي على جودة لا تقبل المساومة. »"
                : "“ At Crystal Blinds, we don't just cover windows... we protect your privacy and outline the character of your space. Every blind we install is a personal signature of uncompromising quality. ”"}
            </blockquote>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#d4af37] overflow-hidden bg-[#2B1B17] flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center text-[#d4af37] font-bold text-base select-none">
                  {isAr ? "م ع" : "MA"}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold text-base text-white tracking-wide">{isAr ? "محمود عباس" : "Mahmoud Abbas"}</p>
                <p className="text-[#d4af37] text-xs uppercase tracking-wider font-semibold mt-0.5">{isAr ? "المؤسس" : "Founder"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
