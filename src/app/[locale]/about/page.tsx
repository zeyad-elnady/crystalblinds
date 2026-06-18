import Link from "next/link";
import PageHero from "../PageHero";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'من نحن | كريستال بليندز' : 'About Us | Crystal Blinds',
    description: locale === 'ar' 
      ? 'تعرف على قصة كريستال بليندز ورسالتنا في تقديم أفضل حلول الستائر الفاخرة.' 
      : 'Learn about the story and vision of Crystal Blinds in providing premium luxury blind solutions.',
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <>
      {/* ═══ Page Hero ═══ */}
      <PageHero
        title={isAr ? "من نحن" : "About Us"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "من نحن" : "About Us" },
        ]}
      />

      {/* ═══ Our Story / Vision Section ═══ */}
      <section className={`py-20 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723] relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Image (Luxury Curtain Mockup) */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#3E2723]/10 shadow-lg">
              <img
                src="/hero_bg.png"
                alt={isAr ? "ستائر كريستال بليندز الفاخرة" : "Crystal Blinds Luxury Curtains"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#3E2723]/10" />
            </div>

            {/* Content text */}
            <div className={`flex flex-col gap-6 ${isAr ? 'text-right' : 'text-left'}`}>
              <span className="text-[#d4af37] uppercase tracking-wider text-xs font-semibold">
                {isAr ? 'من نحن' : 'WHO WE ARE'}
              </span>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#3E2723] leading-snug">
                {isAr ? 'رواد حلول الستائر الفاخرة في مصر' : 'Pioneers of Premium Blind Solutions in Egypt'}
              </h2>
              
              <div className="w-12 h-[2px] bg-[#d4af37] mb-2" />

              <p className="text-[#3E2723]/75 text-sm md:text-base leading-relaxed">
                {isAr 
                  ? "تأسست كريستال بليندز لتكون الوجهة الأولى لكل من يبحث عن التميز والأناقة في عالم الستائر. على مدار سنوات، قمنا بتنفيذ مئات المشاريع السكنية والتجارية، مقدمين أحدث التقنيات والأنظمة الذكية (الموتورايزد) إلى جانب الخامات الكلاسيكية والحديثة بجودة لا تضاهى."
                  : "Crystal Blinds was founded to be the premier destination for anyone seeking distinction and elegance in the world of blinds. Over the years, we have completed hundreds of residential and commercial projects, offering the latest motorized systems alongside classic and modern materials with unmatched quality."
                }
              </p>

              <p className="text-[#3E2723]/75 text-sm md:text-base leading-relaxed">
                {isAr
                  ? "نؤمن بأن الستائر ليست مجرد قطعة قماش، بل هي عنصر أساسي يكمل جمال التصميم المعماري ويتحكم بدقة في الضوء والحرارة والخصوصية. لذلك، نحرص على تقديم استشارات مجانية ورفع المقاسات بدقة متناهية لضمان تركيب احترافي مثالي."
                  : "We believe that blinds are not just fabrics; they are essential architectural elements that shape lighting, heat, and privacy. Therefore, we provide free consultation and precise measurements to guarantee perfect professional installation."
                }
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ Core Values Grid ═══ */}
      <section className={`py-20 px-6 md:px-12 bg-white text-[#3E2723] border-t border-[#3E2723]/5 ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Section title */}
          <div className="text-center mb-16">
            <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
              {isAr ? 'مبادئنا' : 'OUR VALUES'}
            </span>
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
              {isAr ? 'الركائز التي نلتزم بها' : 'The Pillars We Hold True'}
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Value 1: Quality */}
            <div className="p-8 rounded-2xl bg-[#FFFDFA] border border-[#3E2723]/5 hover:border-[#d4af37]/30 hover:shadow-[0_15px_30px_rgba(62,39,35,0.03)] transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center mb-6 text-[#d4af37]">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{isAr ? 'الجودة المطلقة' : 'Absolute Quality'}</h3>
              <p className="text-sm text-[#3E2723]/70 leading-relaxed">
                {isAr
                  ? 'نختار خاماتنا بعناية فائقة من أفضل المصادر العالمية لضمان ثبات الألوان، مقاومة الحريق، وعمر افتراضي طويل للستائر.'
                  : 'We source our materials meticulously from top global manufacturers to guarantee color fastness, fire resistance, and durability.'}
              </p>
            </div>

            {/* Value 2: Custom Design */}
            <div className="p-8 rounded-2xl bg-[#FFFDFA] border border-[#3E2723]/5 hover:border-[#d4af37]/30 hover:shadow-[0_15px_30px_rgba(62,39,35,0.03)] transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center mb-6 text-[#d4af37]">
                <span className="material-symbols-outlined text-3xl">design_services</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{isAr ? 'تصميم مخصص' : 'Bespoke Design'}</h3>
              <p className="text-sm text-[#3E2723]/70 leading-relaxed">
                {isAr
                  ? 'نصمم كل ستارة لتناسب أبعاد غرفتك واحتياجاتك بدقة، مع إمكانية طباعة تصميمات مخصصة أو استخدام أنظمة تحكم ذكية.'
                  : 'We customize each treatment to fit your exact dimensions and desires, with options for custom prints or smart automated systems.'}
              </p>
            </div>

            {/* Value 3: Service */}
            <div className="p-8 rounded-2xl bg-[#FFFDFA] border border-[#3E2723]/5 hover:border-[#d4af37]/30 hover:shadow-[0_15px_30px_rgba(62,39,35,0.03)] transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center mb-6 text-[#d4af37]">
                <span className="material-symbols-outlined text-3xl">handshake</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{isAr ? 'التزام تام بالخدمة' : 'Committed Service'}</h3>
              <p className="text-sm text-[#3E2723]/70 leading-relaxed">
                {isAr
                  ? 'من المعاينة ورفع المقاسات وحتى التركيب والصيانة، فريق مهندسينا وفنيينا يلتزم بالدقة والمواعيد بنسبة ١٠٠٪.'
                  : 'From measuring to professional installation and care, our team of technicians and experts is 100% committed to timeline and accuracy.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#3E2723] text-white overflow-hidden text-center border-t-2 border-[#d4af37]/20">
        {/* Background image fade */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <img src="/hero_bg.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-10 bg-[#3E2723]/95 pointer-events-none" />

        <div className="relative z-20 max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl md:text-5xl font-bold mb-6">
            {isAr ? 'دعنا نساعدك في اختيار ستائر أحلامك' : 'Let Us Help You Choose Your Dream Blinds'}
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-10 max-w-xl mx-auto">
            {isAr
              ? 'احجز معاينتك المجانية اليوم، وسيقوم مهندسينا بزيارتك وتقديم عينات حية تناسب مساحتك تماماً.'
              : 'Book your free design visit today, and our engineers will visit you with live fabric samples for your space.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}#reserve`}
              className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#c5a030] text-[#3E2723] font-bold rounded-lg transition-all shadow-md text-sm"
            >
              {isAr ? 'احجز معاينة مجانية' : 'Book Free Consultation'}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-bold rounded-lg transition-all text-sm"
            >
              {isAr ? 'اتصل بنا' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
