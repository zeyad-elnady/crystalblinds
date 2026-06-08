import React from "react";

export default function AboutUs({ isAr }: { isAr: boolean }) {
  const items = [
    {
      num: "01",
      titleAr: "الأناقة والتصميم",
      titleEn: "Elegance & Design",
      descAr: "تصميمات عصرية تتناغم بسلاسة مع أي ديكور داخلي، لترتقي بجمال مساحتك.",
      descEn: "Modern designs that seamlessly blend with any interior, elevating the aesthetic of your space.",
      icon: "diamond",
      image: "/photos for crystal/1.jpeg"
    },
    {
      num: "02",
      titleAr: "الخبرة الاحترافية",
      titleEn: "Professional Expertise",
      descAr: "تنفيذ دقيق وتركيب احترافي لضمان الجودة والمتانة.",
      descEn: "Decades of experience ensuring flawless execution and installation by our dedicated team.",
      icon: "workspace_premium",
      image: "/photos for crystal/2.jpeg"
    },
    {
      num: "03",
      titleAr: "الأمانة الفنية",
      titleEn: "Technical Honesty",
      descAr: "ننصحك بما يحتاجه المكان فعلاً، بأفضل الخامات والأسعار الممكنة.",
      descEn: "We advise you on what the space truly needs, with the best materials and prices.",
      icon: "verified_user",
      image: "/photos for crystal/3.jpeg"
    },
    {
      num: "04",
      titleAr: "خدمة ما بعد البيع",
      titleEn: "After-Sales Service",
      descAr: "ضمان ممتد ودعم فني لضمان عمل ستائرك بكفاءة لسنوات.",
      descEn: "Extended warranty and technical support to ensure your blinds work flawlessly for years.",
      icon: "support_agent",
      image: "/photos for crystal/4.jpeg"
    }
  ];

  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-[#FFFDFA] relative overflow-hidden text-[#3E2723]">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#3E2723]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`max-w-7xl mx-auto relative z-10 ${isAr ? "text-right rtl" : "text-left ltr"}`}>
        
        {/* Section Heading */}
        <div className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative">
          <div>
            <span className="text-[#d4af37] uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold mb-3 block">
              {isAr ? "لماذا تختارنا" : "WHY CHOOSE US"}
            </span>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#3E2723] leading-tight">
              {isAr ? (
                <>الفرق مع <br/><span className="italic text-[#d4af37]">كريستال للستائر</span></>
              ) : (
                <>The Crystal Blinds <br/><span className="italic text-[#d4af37]">Difference</span></>
              )}
            </h2>
          </div>
          <p className="text-[#3E2723]/70 font-light text-base md:text-lg leading-relaxed max-w-xl pb-2">
            {isAr 
              ? "انطلقت رحلتنا برؤية طموحة. نحن لا نقدم مجرد منتجات، بل نصنع تجربة متكاملة من الأناقة والاحترافية مصممة خصيصًا لتناسب ذوقك الرفيع."
              : "Our journey started with an ambitious vision. We don't just offer products, we create a complete experience of elegance and professionalism tailored to your refined taste."}
          </p>
        </div>

        {/* Features / Differences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="group relative flex flex-col bg-white border border-[#3E2723]/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(62,39,35,0.02)] hover:shadow-[0_20px_40px_rgba(62,39,35,0.06)] hover:border-[#d4af37]/30 transition-all duration-500"
            >
              {/* Photo Header */}
              <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt={isAr ? item.titleAr : item.titleEn} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Oversized Stencil Number */}
                <span className={`absolute top-4 ${isAr ? "left-4" : "right-4"} font-mono text-4xl font-extrabold text-white/30 tracking-tighter select-none transition-colors duration-300 group-hover:text-[#d4af37]/50`}>
                  {item.num}
                </span>
              </div>

              {/* Floating Badge (Centered at intersection of image and content) */}
              <div className="relative">
                <div className={`absolute -top-6 ${isAr ? "right-6" : "left-6"} w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa841c] text-white flex items-center justify-center shadow-lg border-2 border-white z-10 transition-transform duration-500 group-hover:rotate-[360deg]`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
              </div>

              {/* Content Area */}
              <div className={`flex flex-col flex-1 p-6 pt-8 ${isAr ? "items-start text-right" : "items-start text-left"}`}>
                <h3 className="text-lg font-bold text-[#3E2723] mb-3 transition-colors duration-300 group-hover:text-[#d4af37]">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-[#3E2723]/70 text-xs md:text-sm leading-relaxed font-light">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Founder Section */}
        <div className="relative bg-[#3E2723] bg-gradient-to-br from-[#3E2723] via-[#3E2723] to-[#1c110f] rounded-3xl p-8 md:p-16 overflow-hidden border border-[#d4af37]/20 shadow-[0_20px_50px_rgba(62,39,35,0.15)]">
          {/* Decorative quote icon background */}
          <div className={`absolute top-6 ${isAr ? "left-8" : "right-8"} text-white/5 pointer-events-none select-none`}>
            <span className="material-symbols-outlined text-[120px] md:text-[200px] font-bold">format_quote</span>
          </div>
          
          {/* Subtle glow layers */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3E2723]/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="material-symbols-outlined text-4xl text-[#d4af37] mb-6 block opacity-85">format_quote</span>
            
            <blockquote className="text-lg md:text-2xl font-light leading-relaxed text-white/95 mb-8 max-w-4xl">
              {isAr 
                ? "« في كريستال للستائر، نحن لا نغطي الشبابيك.. نحن نحمي خصوصيتك، ونرسم ملامح مكتبك. كل ستارة نركبها هي توقيع شخصي على جودة لا تقبل المساومة. »"
                : "“ At Crystal Blinds, we don't just cover windows... we protect your privacy and outline the character of your space. Every blind we install is a personal signature of uncompromising quality. ”"}
            </blockquote>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#d4af37]/40 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-md">
                <div className="w-full h-full flex items-center justify-center bg-[#FFFDFA]/10 text-[#d4af37] font-bold text-base select-none">
                  {isAr ? "م ع" : "MA"}
                </div>
              </div>
              <div className="flex flex-col">
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
