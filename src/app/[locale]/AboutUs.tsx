import React from "react";

export default function AboutUs({ isAr }: { isAr: boolean }) {
  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-white relative overflow-hidden text-zinc-900">
      <div className={`max-w-7xl mx-auto relative z-10 ${isAr ? "text-right rtl" : "text-left ltr"}`}>
        
        {/* Section Heading */}
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative">
          <div>
            <span className="text-[#d4af37] uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold mb-4 block">
              {isAr ? "لماذا تختارنا" : "WHY CHOOSE US"}
            </span>
            <h2 className="font-headline text-5xl md:text-6xl font-light text-zinc-900 leading-tight">
              {isAr ? (
                <>الفرق مع <br/><span className="italic text-[#d4af37]">كريستال للستائر</span></>
              ) : (
                <>The Crystal Blinds <br/><span className="italic text-[#d4af37]">Difference</span></>
              )}
            </h2>
          </div>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-md pb-2">
            {isAr 
              ? "انطلقت رحلتنا برؤية طموحة. نحن لا نقدم مجرد منتجات، بل نصنع تجربة متكاملة من الأناقة والاحترافية مصممة خصيصًا لتناسب ذوقك الرفيع."
              : "We don't just sell blinds; we craft a complete experience of elegance and professionalism tailored to your refined taste."}
          </p>
        </div>

        {/* Features / Differences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-32">
          {[
            {
              num: "01",
              titleAr: "الأناقة والتصميم",
              titleEn: "Elegance & Design",
              descAr: "تصميمات عصرية تتناغم بسلاسة مع أي ديكور داخلي، لترتقي بجمال مساحتك.",
              descEn: "Modern designs that seamlessly blend with any interior, elevating the aesthetic of your space.",
              icon: "diamond"
            },
            {
              num: "02",
              titleAr: "الخبرة الاحترافية",
              titleEn: "Professional Expertise",
              descAr: "تنفيذ دقيق وتركيب احترافي لضمان الجودة والمتانة.",
              descEn: "Decades of experience ensuring flawless execution and installation by our dedicated team.",
              icon: "workspace_premium"
            },
            {
              num: "03",
              titleAr: "الأمانة الفنية",
              titleEn: "Technical Honesty",
              descAr: "ننصحك بما يحتاجه المكان فعلاً، بأفضل الخامات والأسعار الممكنة.",
              descEn: "We advise you on what the space truly needs, with the best materials and prices.",
              icon: "verified_user"
            },
            {
              num: "04",
              titleAr: "خدمة ما بعد البيع",
              titleEn: "After-Sales Service",
              descAr: "ضمان ممتد ودعم فني لضمان عمل ستائرك بكفاءة لسنوات.",
              descEn: "Extended warranty and technical support to ensure your blinds work flawlessly for years.",
              icon: "support_agent"
            }
          ].map((item, i) => (
            <div key={i} className="bg-[#fafafa] rounded-3xl p-10 md:p-14 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-transparent hover:border-zinc-100">
              <span className={`absolute -top-12 ${isAr ? "-left-4" : "-right-4"} text-[140px] font-black text-zinc-100 select-none group-hover:scale-110 group-hover:text-zinc-200/50 transition-all duration-700`}>
                {item.num}
              </span>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm border border-zinc-100">
                  <span className="material-symbols-outlined text-[#d4af37] text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-2xl text-zinc-800 mb-4 font-medium">{isAr ? item.titleAr : item.titleEn}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Founder Section */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <span className="material-symbols-outlined text-6xl text-[#d4af37] mb-8 block opacity-80">format_quote</span>
            <h4 className="text-2xl md:text-3xl font-light leading-relaxed mb-10 max-w-4xl text-zinc-100">
              {isAr 
                ? "في كريستال للستائر، نحن لا نغطي الشبابيك.. نحن نحمي خصوصيتك، ونرسم ملامح مكتبك. كل ستارة نركبها هي توقيع شخصي على جودة لا تقبل المساومة."
                : "At Crystal Blinds, we don't cover windows... we protect your privacy and draw the features of your office. Every blind we install is a personal signature on uncompromising quality."}
            </h4>
            <div className="flex items-center gap-6">
              <div className="w-16 h-[1px] bg-[#d4af37]" />
              <div>
                <p className="font-bold text-lg text-white tracking-wide">{isAr ? "محمود عباس" : "Mahmoud Abbas"}</p>
                <p className="text-[#d4af37] text-sm uppercase tracking-wider mt-1">{isAr ? "المؤسس" : "Founder"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
