import Image from "next/image";

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <>
      {/* Hero Section */}
      <section className="px-6 py-12 hero-gradient mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto text-center mt-8">
          <h1 className="text-4xl md:text-6xl font-headline text-primary mb-6 leading-tight">
            {isAr ? "اتصل بنا - احجز استشارة" : "Contact Us - Book a Consultation"}
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "اكتشف فن تصميم الستائر الخاص بك. مستشارونا الخبراء جاهزون لزيارتك في منزلك." 
              : "Experience the artistry of bespoke drapery. Our master consultants bring the atelier to your home."}
          </p>
        </div>
      </section>

      {/* Multi-Step Consultation Form */}
      <section className="px-6 -mt-8 relative z-10">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10 border-b border-outline-variant/30 pb-6">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold mb-2">1</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{isAr ? "معلومات شخصية" : "Personal"}</span>
            </div>
            <div className="h-px bg-outline-variant flex-grow mx-4 -mt-6"></div>
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-surface-container-high text-secondary flex items-center justify-center text-xs font-bold mb-2">2</span>
              <span className="text-[10px] uppercase tracking-widest text-secondary">{isAr ? "الأسلوب" : "Aesthetic"}</span>
            </div>
            <div className="h-px bg-outline-variant flex-grow mx-4 -mt-6"></div>
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-surface-container-high text-secondary flex items-center justify-center text-xs font-bold mb-2">3</span>
              <span className="text-[10px] uppercase tracking-widest text-secondary">{isAr ? "الموعد" : "Schedule"}</span>
            </div>
          </div>

          <form className={`space-y-8 ${isAr ? 'rtl' : ''}`}>
            {/* Step 1 Content */}
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-primary mb-2">{isAr ? "الاسم الكامل" : "Full Name"}</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-tertiary transition-colors text-primary placeholder-outline/50 outline-none" 
                  placeholder={isAr ? "الاسم كما يظهر في السجلات الرسمية" : "Your name as it appears on official records"} 
                  type="text"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-primary mb-2">{isAr ? "رقم الهاتف" : "Phone Number"}</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-tertiary transition-colors text-primary placeholder-outline/50 outline-none" 
                  placeholder={isAr ? "+966 50 000 0000" : "+1 (555) 000-0000"} 
                  type="tel"
                />
              </div>

              {/* Step 2 Content Fragment (Style Preference) */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-primary mb-4">{isAr ? "القماش المفضل" : "Fabric Preference"}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-4 rounded-lg cursor-pointer border-2 border-primary">
                    <div className="text-xs font-bold text-primary uppercase tracking-tighter">{isAr ? "الحرير الخالص" : "Raw Silk"}</div>
                    <div className="text-[10px] text-secondary">{isAr ? "لامع وهيكلي" : "Lustrous & Structural"}</div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg cursor-pointer border-2 border-transparent hover:border-outline-variant transition-all">
                    <div className="text-xs font-bold text-primary uppercase tracking-tighter">{isAr ? "المخمل" : "Crushed Velvet"}</div>
                    <div className="text-[10px] text-secondary">{isAr ? "غني وملمس عميق" : "Rich & Deeply Textured"}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-primary mb-2">{isAr ? "تاريخ الاستشارة المفضل" : "Preferred Consultation Date"}</label>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-tertiary transition-colors text-primary outline-none" 
                    type="date"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-primary text-on-primary py-5 rounded-full font-medium tracking-wide shadow-xl shadow-primary/10 transition-transform active:scale-95" type="button">
              {isAr ? "طلب زيارة القياس" : "Request Measurement Visit"}
            </button>
            <p className="text-center text-[10px] text-secondary/60 uppercase tracking-widest">
              {isAr ? "سيقوم المستشار بالتأكيد خلال 24 ساعة" : "A consultant will confirm within 24 hours"}
            </p>
          </form>
        </div>
      </section>

      {/* Social Proof & FAQ Bento */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isAr ? 'rtl' : ''}`}>
          {/* FAQ Accordion */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-headline text-primary mb-8">{isAr ? "الأسئلة الشائعة" : "Frequently Asked"}</h2>
            <div className="space-y-4">
              <details className="group bg-surface-container-low rounded-xl px-6 py-4" open>
                <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                  <span className="font-medium text-primary">{isAr ? "كم مدة استشارة المنزل؟" : "How long is the home consultation?"}</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="pt-4 text-sm text-secondary leading-relaxed">
                  {isAr 
                    ? "يقضي مستشارونا المحترفون عادة 60-90 دقيقة في مساحتك. يشمل ذلك أخذ قياسات دقيقة، وتقييم الإضاءة، وتجربة عينات الأقمشة مع ديكورك الحالي."
                    : "Our master consultants typically spend 60-90 minutes in your space. This includes taking precision measurements, assessing lighting, and exploring fabric samples against your existing decor."}
                </div>
              </details>
              
              <details className="group bg-surface-container-low rounded-xl px-6 py-4">
                <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                  <span className="font-medium text-primary">{isAr ? "هل توجد رسوم لزيارة القياس؟" : "Is there a fee for the measurement visit?"}</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="pt-4 text-sm text-secondary leading-relaxed">
                  {isAr 
                    ? "الاستشارة الأولية مجانية للطلبات ضمن دائرة نصف قطرها 50 ميلاً من معارضنا في المدن. للمواقع البعيدة، قد يتم تطبيق رسوم سفر بسيطة، يتم خصمها من عملية الشراء النهائية."
                    : "The initial consultation is complimentary for orders within a 50-mile radius of our urban ateliers. For remote locations, a small travel fee may apply, deductible from your final purchase."}
                </div>
              </details>
              
              <details className="group bg-surface-container-low rounded-xl px-6 py-4">
                <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                  <span className="font-medium text-primary">{isAr ? "ما هو الوقت المتوقع للتسليم؟" : "What is the bespoke lead time?"}</span>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="pt-4 text-sm text-secondary leading-relaxed">
                  {isAr 
                    ? "من القياس النهائي إلى التركيب اليدوي، تتطلب عملية Silk & Stone عادةً حوالي 4-6 أسابيع لمعظم المنسوجات المتميزة."
                    : "From final measurement to hand-finished installation, the Silk & Stone process typically requires 4-6 weeks for most premium textiles."}
                </div>
              </details>
            </div>
          </div>
          
          {/* Testimonial Card */}
          <div className="bg-primary-container text-on-primary-container p-8 rounded-xl flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-tertiary-fixed text-4xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
              <p className="text-lg italic font-serif leading-relaxed mb-6">
                {isAr 
                  ? "كانت الاستشارة فاخرة بقدر فخامة الأقمشة نفسها. لقد حولوا غرفتنا الرئيسية إلى ملاذ من الضوء الناعم والمخمل الثقيل."
                  : '"The consultation was as luxurious as the fabrics themselves. They transformed our master suite into a sanctuary of soft light and heavy velvet."'}
              </p>
            </div>
            <div className={`flex items-center gap-4 border-t border-on-primary-container/20 pt-6 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-outline-variant shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Elena Vance" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDseE2BuRUnUwk9Mg7V1OIgrVuwzw9jY4tBYsrGRbC_AyEGYUbJu8DttsH1qkUNuzsP3QFs3blYR-vA0bOc8I7q-u44W5AfVKe52FOz-v50kJkXT_XgYdAbYw3WKGwqtDPrW4Cthqhw7S0O7XMt7xZG2PYszlRLfoUoNZwDEPh88aX6LqnCFue0B4zuzg93eV6FJfcHdFVCsQ_t7J8o3PGbtlSIXGE58YcpvzFsFGa_cDEgsjAi9Ngi90Z3M9rclxKkLhi-eS_1How"
                />
              </div>
              <div className={isAr ? "text-right flex-1" : ""}>
                <p className="text-sm font-bold uppercase tracking-widest">{isAr ? "إيلينا فانس" : "Elena Vance"}</p>
                <p className="text-[10px] opacity-70">{isAr ? "مصممة ديكور، لندن" : "Interior Designer, London"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Showrooms / Map Section */}
      <section className="py-20 bg-surface-container">
        <div className="px-6 max-w-6xl mx-auto">
          <div className={`mb-12 ${isAr ? 'text-right' : ''}`}>
            <h2 className="text-2xl font-headline text-primary mb-2">{isAr ? "صالات العرض" : "Our Showrooms"}</h2>
            <p className="text-sm text-secondary">{isAr ? "قم بزيارة معارضنا للحصول على تجربة شخصية." : "Visit our physical ateliers for a tactile experience."}</p>
          </div>
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch ${isAr ? 'rtl' : ''}`}>
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 bg-surface-container-lowest border-l-4 border-tertiary shadow-sm">
                <h3 className="font-bold text-primary mb-2 uppercase tracking-wide">{isAr ? "الفرع الرئيسي - نايتسبريدج" : "The Flagship - Knightsbridge"}</h3>
                <p className="text-xs text-secondary leading-relaxed mb-4">12 Brompton Rd, London SW1X 7QN, UK</p>
                <a className={`text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`} href="#">
                  {isAr ? "احصل على الاتجاهات" : "Get Directions"} <span className={`material-symbols-outlined text-sm ${isAr ? 'scale-x-[-1]' : ''}`}>north_east</span>
                </a>
              </div>
              <div className="p-6 bg-surface-container-lowest/50 border-l-4 border-transparent hover:border-outline-variant transition-all cursor-pointer">
                <h3 className="font-bold text-primary/60 mb-2 uppercase tracking-wide">{isAr ? "حي دبي للتصميم" : "Dubai Design District"}</h3>
                <p className="text-xs text-secondary/60 leading-relaxed mb-4">Building 7, d3, Dubai, UAE</p>
                <a className={`text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`} href="#">
                  {isAr ? "احصل على الاتجاهات" : "Get Directions"} <span className={`material-symbols-outlined text-sm ${isAr ? 'scale-x-[-1]' : ''}`}>north_east</span>
                </a>
              </div>
              <div className="p-6 bg-surface-container-lowest/50 border-l-4 border-transparent hover:border-outline-variant transition-all cursor-pointer">
                <h3 className="font-bold text-primary/60 mb-2 uppercase tracking-wide">{isAr ? "الجادة الخامسة - مانهاتن" : "Fifth Avenue - Manhattan"}</h3>
                <p className="text-xs text-secondary/60 leading-relaxed mb-4">712 5th Ave, New York, NY 10019</p>
                <a className={`text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`} href="#">
                  {isAr ? "احصل على الاتجاهات" : "Get Directions"} <span className={`material-symbols-outlined text-sm ${isAr ? 'scale-x-[-1]' : ''}`}>north_east</span>
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-8 h-[400px] lg:h-auto rounded-xl overflow-hidden relative shadow-2xl">
              <img 
                className="w-full h-full object-cover" 
                alt="Showroom Map" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsV8TKuPvSBhtCyDE8-ZFayFDZ2bBdIJrS0UZYtli9C29jcBSL5wi5io9CdYU4J61D2dD8ZxcCmKEG96IBFj7T8Hy6RmGZ4iflCcbBMRiI6hnDYrYzAO02lMn_S3gEKx9WSX8oyCPKn2JERr7T2moT2YU8yXwVv0mM3ypeVOdktgth-wEXL7aHHaAbBRLOHqvRhuQiUedgz57zsKHpEpNxUcA1x1bliTzCWZwu7oYd85CvrS8E1Yhy2y0CrqObhX98QCm-SK63xgg"
              />
              {/* Custom Map Overlay UI */}
              <div className="absolute inset-0 bg-primary/20 backdrop-grayscale-[0.5] mix-blend-multiply"></div>
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-4 h-4 bg-tertiary-fixed rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-4 h-4 bg-tertiary rounded-full border-2 border-on-primary relative z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
