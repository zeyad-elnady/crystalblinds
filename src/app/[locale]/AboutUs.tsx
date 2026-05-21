import React from "react";

export default function AboutUs({ isAr }: { isAr: boolean }) {
  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-[#faf8f5] relative overflow-hidden text-[#6A311D]">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#e9c176]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className={`max-w-7xl mx-auto relative z-10 ${isAr ? "text-right rtl" : "text-left ltr"}`}>
        
        {/* Section Heading */}
        <div className="mb-24 flex flex-col items-center text-center relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-bold">
              {isAr ? "من نحن" : "About Us"}
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
          
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl bg-gradient-to-br from-[#1c1109] to-[#5d4201] bg-clip-text text-transparent leading-tight max-w-4xl pb-2">
            {isAr ? "ننسج الجمال والخصوصية لتكتمل أناقة مساحتك" : "Weaving Beauty and Privacy to Complete the Elegance of Your Space"}
          </h2>
          
          <div className="mt-10 relative max-w-3xl">
            {/* Subtle quotation watermark */}
            <span className="material-symbols-outlined absolute -top-8 -left-6 text-6xl text-[#d4af37]/10 -z-10 rotate-180">format_quote</span>
            <span className="material-symbols-outlined absolute -bottom-8 -right-6 text-6xl text-[#d4af37]/10 -z-10">format_quote</span>
            
            <p className="text-[#6A311D]/75 text-sm md:text-[15px] leading-[1.8] md:leading-[2] font-medium relative z-10 px-4 md:px-8">
              {isAr 
                ? "انطلقت رحلة \"كريستال للستائر\" في عام ٢٠٢١ برؤية طموحة لمؤسسها محمود عباس، لتتحول من شغف عميق بالتفاصيل إلى علامة رائدة في عالم الستائر وتغطية النوافذ. نحن لا نقدم مجرد منتجات، بل نصنع تجربة متكاملة تجمع بين التصميم المبتكر والخامات الفاخرة لتناسب المكاتب والمنازل على حد سواء. برؤية هندسية دقيقة، وحرفية عالية في التركيب، نضمن لك حلاً يجمع بين الأداء العملي والمظهر الجمالي الجذاب، لنكون شركاءك في تحويل كل نافذة إلى لوحة فنية تعكس ذوقك الرفيع."
                : "The journey of Crystal Blinds began in 2021 with an ambitious vision by its founder, Mahmoud Abbas, transforming a deep passion for details into a leading brand in the world of window coverings. We don't just offer products; we craft a complete experience combining innovative design with premium materials suited for both offices and homes. With precise engineering and masterful installation, we guarantee a solution that unites practical performance with a captivating aesthetic, partnering with you to turn every window into a masterpiece that reflects your refined taste."}
            </p>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#faf8f5] border border-[#d4af37]/20 rounded-2xl p-8 md:p-12 hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
            <div className="w-14 h-14 rounded-full bg-white border border-[#d4af37]/30 flex items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[#d4af37] text-2xl">visibility</span>
            </div>
            <h3 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "الرؤية (Vision)" : "Our Vision"}</h3>
            <p className="text-[#6A311D]/70 text-sm md:text-base leading-relaxed">
              {isAr
                ? "أن نكون الوجهة الأولى في مصر التي تُصهر \"فن الستارة\" مع \"تكنولوجيا التغطية\"، لنحول كل شباك أو واجهة زجاجية إلى لوحة فنية متناغمة، ونثبت أن الجودة ليست بكثرة الموظفين، بل بإخلاص \"الفني\" وعقلية \"المهندس\"."
                : "To be the premier destination in Egypt that fuses the 'art of blinds' with 'covering technology', transforming every window or glass facade into a harmonious masterpiece, proving that quality is not about the number of employees, but the dedication of the 'technician' and the mindset of the 'engineer'."}
            </p>
          </div>
          
          <div className="bg-[#faf8f5] border border-[#d4af37]/20 rounded-2xl p-8 md:p-12 hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-500 relative overflow-hidden group md:translate-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
            <div className="w-14 h-14 rounded-full bg-white border border-[#d4af37]/30 flex items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[#d4af37] text-2xl">flag</span>
            </div>
            <h3 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "الرسالة (Mission)" : "Our Mission"}</h3>
            <p className="text-[#6A311D]/70 text-sm md:text-base leading-relaxed">
              {isAr
                ? "تقديم حلول متكاملة لستائر المكاتب والواجهات، تبدأ من اختيار الخامة الأنسب (سواء كانت للخصوصية أوعازلة للحرارة وحجب أشعة الشمس) وتنتهي بتركيب هندسي \"على الشعرة\"، مع الالتزام التام بمواعيد التسليم وأعلى معايير المتانة."
                : "To provide integrated solutions for office and facade blinds, starting from choosing the most suitable material (whether for privacy, thermal insulation, or sun-blocking) and ending with an absolutely precise installation, with full commitment to delivery times and the highest durability standards."}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="font-headline text-3xl md:text-4xl text-[#6A311D] mb-4">{isAr ? "القيم الجوهرية" : "Core Values"}</h3>
            <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "verified_user",
                titleAr: "الأمانة الفنية",
                titleEn: "Technical Honesty",
                descAr: "ننصحك بما يحتاجه المكان فعلاً، لا بما نريد بيعه.",
                descEn: "We advise you on what the space truly needs, not just what we want to sell."
              },
              {
                icon: "architecture",
                titleAr: "الدقة المتناهية",
                titleEn: "Extreme Precision",
                descAr: "القياس عندنا \"بالملي\"، والتركيب \"مسطرة\".",
                descEn: "Our measurement is 'by the millimeter' and installation is flawless."
              },
              {
                icon: "handshake",
                titleAr: "الروح المصرية",
                titleEn: "Egyptian Spirit",
                descAr: "تعامل مريح، مرونة في الحلول، و\"كلمة شرف\" قبل التعاقد.",
                descEn: "Comfortable dealings, flexibility in solutions, and a 'word of honor' before signing contracts."
              },
              {
                icon: "lightbulb",
                titleAr: "الابتكار",
                titleEn: "Innovation",
                descAr: "دمج أحدث تقنيات الطباعة مع الستارة المكتبية لخلق هوية بصرية لشركتك.",
                descEn: "Integrating the latest printing technologies with office blinds to create a visual identity for your company."
              }
            ].map((value, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white border border-[#6A311D]/5 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-[#faf8f5] rounded-full flex items-center justify-center mb-4 text-[#d4af37]">
                  <span className="material-symbols-outlined">{value.icon}</span>
                </div>
                <h4 className="font-headline text-lg font-semibold mb-2">{isAr ? value.titleAr : value.titleEn}</h4>
                <p className="text-sm text-[#6A311D]/70 leading-relaxed">{isAr ? value.descAr : value.descEn}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-24 bg-[#6A311D] rounded-3xl p-8 md:p-16 text-[#faf8f5] relative overflow-hidden">

          <div className="relative z-10">
            <h3 className="font-headline text-3xl md:text-4xl text-[#d4af37] mb-2">{isAr ? "تخصصاتنا" : "Our Specialties"}</h3>
            <p className="text-[#faf8f5]/70 mb-10 text-sm md:text-base max-w-2xl">{isAr ? "نحن ملوك \"التفاصيل\" في كافة أنواع الستائر المكتبية، ونتعامل مع كل خامة بأسلوبها الخاص:" : "We excel in the 'details' of all types of office blinds, handling each material with its unique style:"}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {[
                { titleAr: "ستائر شرائح المعدنية", titleEn: "Aluminum Venetian Blinds", descAr: "متانة الألومنيوم بلمسة عصرية.", descEn: "Aluminum durability with a modern touch." },
                { titleAr: "ستائر شرائح خشبية", titleEn: "Wooden Venetian Blinds", descAr: "فخامة الطبيعة التي تضفي دفئاً على مكاتب المديرين.", descEn: "The luxury of nature that adds warmth to executive offices." },
                { titleAr: "ستائر رول صن لايت", titleEn: "Sunlight Roller Blinds", descAr: "الحل الأمثل لتصفية ضوء النهار مع عدم المساس بالخصوصية.", descEn: "The perfect solution for filtering daylight without compromising privacy." },
                { titleAr: "ستائر رول صن سكرين", titleEn: "Sunscreen Roller Blinds", descAr: "حجب الحرارة والوهج مع الحفاظ على الرؤية الخارجية.", descEn: "Blocking heat and glare while preserving the outside view." },
                { titleAr: "ستائر رول بلاك أوت", titleEn: "Blackout Roller Blinds", descAr: "عزل تام للضوء والحرارة بنسبة 100%.", descEn: "100% complete isolation from light and heat." },
                { titleAr: "ستائر شرائح زيبرآ", titleEn: "Zebra Blinds", descAr: "التلاعب بالضوء والظل في تصميم واحد مبتكر.", descEn: "Playing with light and shadow in one innovative design." },
                { titleAr: "ستاائر شرائح رأسية", titleEn: "Vertical Blinds", descAr: "الحل العملي والإقتصادي للتحكم في الضوء.", descEn: "The practical and economical solution for light control." },
                { titleAr: "ستائر خشب البامبو", titleEn: "Bamboo Blinds", descAr: "لمسة ريفية طبيعية صديقة للبيئة.", descEn: "A natural, eco-friendly rustic touch." },
                { titleAr: "ستائر دبل سيستم", titleEn: "Double System Blinds", descAr: "دمج الـبلاك أوت والزيبرآ أو الـصن سكرين في نظام واحد للتحكم المطلق.", descEn: "Combining Blackout and Zebra or Sunscreen in one system for ultimate control." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-[#d4af37] text-xl shrink-0 mt-1">check_circle</span>
                  <div>
                    <h5 className="font-semibold text-[#faf8f5] text-sm md:text-base">{isAr ? item.titleAr : item.titleEn}</h5>
                    <p className="text-xs md:text-sm text-[#faf8f5]/60 mt-1">{isAr ? item.descAr : item.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Crystal / Founder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h3 className="font-headline text-3xl md:text-4xl text-[#6A311D] mb-8">{isAr ? "لماذا كريستال للستائر؟" : "Why Crystal Blinds?"}</h3>
            <div className="space-y-6">
              {[
                { titleAr: "خبرة \"الفني الشاطر\"", titleEn: "The 'Skilled Technician' Experience", descAr: "محمود عباس لا يدير فقط، بل يشرف على كل \"مسمار\"، مما يضمن جودة لا توفرها الشركات الكبرى التي تعتمد على عمالة متغيرة.", descEn: "Mahmoud Abbas does not just manage; he oversees every 'screw', ensuring quality not provided by larger companies that rely on transient labor." },
                { titleAr: "حلول الواجهات المعقدة", titleEn: "Complex Facade Solutions", descAr: "لا توجد مساحة \"صعبة\" علينا؛ من النوافذ الصغيرة إلى الواجهات الزجاجية العملاقة، لدينا الحل التقني والجمالي.", descEn: "No space is too 'difficult' for us; from small windows to giant glass facades, we have the technical and aesthetic solution." },
                { titleAr: "سرعة التسليم والتركيب", titleEn: "Speed of Delivery and Installation", descAr: "الالتزام بالجداول الزمنية وتقديم حلول سريعة وفعالة دون المساس بالجودة.", descEn: "Commitment to schedules and providing fast, effective solutions without compromising quality." },
                { titleAr: "الطباعة", titleEn: "Printing", descAr: "حول ستائرك إلى لوحات إعلانية أو فنية من خلال خدمة الطباعة حسب الطلب بجودة ألوان تدوم لسنوات.", descEn: "Turn your blinds into advertising or artistic canvases through our custom printing service with color quality that lasts for years." },
                { titleAr: "خدمة ما بعد البيع", titleEn: "After-Sales Service", descAr: "علاقتنا بك لا تنتهي بانتهاء التركيب، نحن نضمن لك \"ميكانيزم\" يعمل بسلاسة كأنه جديد دائماً.", descEn: "Our relationship with you does not end with installation; we guarantee a 'mechanism' that works smoothly as if it's always new." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 bg-[#d4af37] shrink-0 rounded-full" />
                  <div>
                    <h5 className="font-bold text-[#6A311D] text-base">{isAr ? item.titleAr : item.titleEn}</h5>
                    <p className="text-sm text-[#6A311D]/70 mt-1">{isAr ? item.descAr : item.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="bg-[#faf8f5] p-8 md:p-10 rounded-2xl border border-[#d4af37]/30 relative z-10 shadow-xl">
              <span className="material-symbols-outlined text-6xl text-[#d4af37]/20 absolute top-6 right-6 font-serif">format_quote</span>
              <h4 className="font-headline text-xl text-[#6A311D] mb-2">{isAr ? "كلمة المؤسس" : "Founder's Word"}</h4>
              <p className="text-[#d4af37] font-semibold text-sm mb-6">{isAr ? "محمود عباس" : "Mahmoud Abbas"}</p>
              <p className="text-[#6A311D]/80 italic leading-relaxed text-sm md:text-base relative z-10 font-serif">
                "{isAr 
                  ? "في كريستال للستائر، نحن لا نغطي الشبابيك.. نحن نحمي خصوصيتك، ونرسم ملامح مكتبك. حين بدأت بمفردي في 2021، كان رهاني على 'السمعة الطيبة' و'الشغل النظيف'.. واليوم، كل ستارة نركبها هي توقيع شخصي مني على جودة لا تقبل المساومة."
                  : "At Crystal Blinds, we don't cover windows... we protect your privacy and draw the features of your office. When I started alone in 2021, my bet was on 'good reputation' and 'clean work'... and today, every blind we install is a personal signature from me on uncompromising quality."}"
              </p>
            </div>
            <div className="absolute top-4 left-4 w-full h-full border-2 border-[#d4af37]/20 rounded-2xl -z-10" />
          </div>
        </div>

      </div>
    </section>
  );
}
