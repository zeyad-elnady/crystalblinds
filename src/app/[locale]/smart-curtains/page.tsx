import { Metadata } from "next";
import Link from "next/link";
import PageHero from "../PageHero";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === 'ar';
  
  return {
    title: isAr ? 'الستائر الذكية' : 'Smart Curtains',
    description: isAr 
      ? 'ستائر ذكية بالريموت كنترول بأفضل جودة وتقنيات متقدمة' 
      : 'Smart Remote Control Curtains with the best quality and advanced tech'
  };
}

export default async function SmartCurtainsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const isAr = params.locale === 'ar';
  
  return (
    <>
      <PageHero
        title={isAr ? "الستائر الذكية" : "Smart Curtains"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${params.locale}` },
          { label: isAr ? "الستائر الذكية" : "Smart Curtains" },
        ]}
      />
      <div className={`w-full flex flex-col items-center px-6 md:px-12 py-16 ${isAr ? "rtl text-right" : "ltr text-left"}`}>
      <div className={`w-full max-w-7xl space-y-20 text-[#3E2723]`}>
        {/* Section 1: Brand Partnership */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-headline text-2xl md:text-3.5xl font-bold text-[#3E2723]">
              {isAr ? "بالتعاون مع أفضل الشركات العالمية" : "In Cooperation with Top Global Brands"}
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Somfy Card */}
            <Link
              href={`/${params.locale}/smart-curtains/somfy`}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-sans font-black text-2xl text-[#E05206]" style={{ fontFamily: 'system-ui, sans-serif' }}>somfy.</span>
                  <span className="bg-[#E05206]/10 text-[#E05206] text-[10px] font-bold px-2 py-0.5 rounded">
                    {isAr ? "فرنسية" : "French"}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{isAr ? "شركة SOMFY الفرنسية" : "French SOMFY Company"}</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-light">
                  {isAr 
                    ? "رائدة عالمياً في حلول الأتمتة المنزلية والستائر الذكية بجودة فرنسية موثوقة منذ أكثر من 50 عاماً."
                    : "A global leader in home automation and smart curtain solutions with reliable French quality for over 50 years."}
                </p>
                <span className="inline-flex items-center gap-2 border border-[#E05206] text-[#E05206] px-6 py-2 rounded-lg text-xs font-semibold group-hover:bg-[#E05206] group-hover:text-white transition-colors">
                  {isAr ? "اكتشف منتجات Somfy" : "Explore Somfy Products"}
                  <span className="material-symbols-outlined text-sm">{isAr ? "arrow_back" : "arrow_forward"}</span>
                </span>
              </div>
              <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center p-4 border border-gray-100 shrink-0 group-hover:bg-[#E05206]/10 transition-colors">
                <span className="material-symbols-outlined text-[#E05206] text-5xl">precision_manufacturing</span>
              </div>
            </Link>

            {/* Azura Card */}
            <Link
              href={`/${params.locale}/smart-curtains/azura`}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-sans font-black text-2xl text-[#0066b2]" style={{ fontFamily: 'system-ui, sans-serif' }}>AZURA</span>
                  <span className="bg-[#0066b2]/10 text-[#0066b2] text-[10px] font-bold px-2 py-0.5 rounded">
                    {isAr ? "تركية" : "Turkish"}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{isAr ? "شركة AZURA التركية" : "Turkish AZURA Company"}</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-light">
                  {isAr 
                    ? "تتميز في تقديم مواتير قوية وهادئة بتقنيات متقدمة وتصميم أنيق يناسب جميع المساحات."
                    : "Distinguished in providing powerful and quiet motors with advanced technologies and elegant design for all spaces."}
                </p>
                <span className="inline-flex items-center gap-2 border border-[#0066b2] text-[#0066b2] px-6 py-2 rounded-lg text-xs font-semibold group-hover:bg-[#0066b2] group-hover:text-white transition-colors">
                  {isAr ? "اكتشف منتجات Azura" : "Explore Azura Products"}
                  <span className="material-symbols-outlined text-sm">{isAr ? "arrow_back" : "arrow_forward"}</span>
                </span>
              </div>
              <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center p-4 border border-gray-100 shrink-0 group-hover:bg-[#0066b2]/10 transition-colors">
                <span className="material-symbols-outlined text-[#0066b2] text-5xl">settings_input_component</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Section 2: Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-headline text-2xl md:text-3.5xl font-bold text-[#3E2723]">
              {isAr ? "مميزات ستائر الريموت كنترول" : "Remote Control Blinds Features"}
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: "diamond", titleAr: "تصميم عصري", titleEn: "Modern Design", descAr: "تناسب جميع الديكورات الحديثة والفاخرة", descEn: "Complements all modern & premium interior designs" },
              { icon: "bolt", titleAr: "توفير الطاقة", titleEn: "Energy Saving", descAr: "تساعد في تقليل استهلاك الكهرباء والتكييف", descEn: "Helps reduce electricity & air conditioner usage" },
              { icon: "verified_user", titleAr: "أمان وحماية", titleEn: "Safety & Security", descAr: "حماية من الحرارة والأشعة فوق البنفسجية", descEn: "Protection from UV rays and outside heat" },
              { icon: "volume_mute", titleAr: "صوت هادئ", titleEn: "Quiet Motor", descAr: "مواتير قوية تعمل بأقل مستوى ضوضاء", descEn: "Powerful motors running with minimal noise" },
              { icon: "smartphone", titleAr: "تحكم ذكي", titleEn: "Smart Control", descAr: "التحكم بالستائر عبر الهاتف أو الريموت", descEn: "Control blinds easily via smartphone or remote" }
            ].map((feat, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                  <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                </div>
                <h4 className="font-bold text-sm">{isAr ? feat.titleAr : feat.titleEn}</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed font-light">{isAr ? feat.descAr : feat.descEn}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Journey */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-headline text-2xl md:text-3.5xl font-bold text-[#3E2723]">
              {isAr ? "رحلة طلب ستائر بالريموت كنترول" : "Order Journey for Smart Blinds"}
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            {[
              { step: "1", titleAr: "تواصل معنا", titleEn: "Contact Us", descAr: "أرسل طلبك أو احجز معاينة مجانية", descEn: "Submit your request or book a free visit" },
              { step: "2", titleAr: "معاينة واستشارة", titleEn: "Visit & Consult", descAr: "نقوم بزيارة الموقع وقياس المساحة", descEn: "We visit the location and measure the spaces" },
              { step: "3", titleAr: "اختيار النظام", titleEn: "System Choice", descAr: "نساعدك في اختيار الموتور المناسب", descEn: "We help you select the ideal motor system" },
              { step: "4", titleAr: "توريد وتركيب", titleEn: "Delivery & Install", descAr: "تركيب احترافي وضبط وبرمجة النظام", descEn: "Professional setup & configuring the system" },
              { step: "5", titleAr: "ضمان وصيانة", titleEn: "Warranty & Support", descAr: "ضمان حقيقي وخدمة صيانة دورية للمحركات", descEn: "Real warranty & continuous customer support" }
            ].map((j, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative flex flex-col items-center text-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#d4af37] text-white flex items-center justify-center text-xs font-bold font-mono">
                  {j.step}
                </div>
                <h4 className="font-bold text-sm mt-1">{isAr ? j.titleAr : j.titleEn}</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed font-light">{isAr ? j.descAr : j.descEn}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Banner */}
        <div className="relative bg-[#2B1B17] text-[#FFFDFA] rounded-[2rem] p-8 md:p-12 overflow-hidden border border-[#d4af37]/20 shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3E2723]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 shrink-0 z-10">
            <span className="material-symbols-outlined text-[#d4af37] text-5xl md:text-6xl animate-bounce">settings_remote</span>
          </div>

          <div className="flex-1 text-center md:text-right space-y-3 z-10">
            <h3 className="font-headline text-xl md:text-2xl font-bold">
              {isAr ? "جرب الراحة... تحكم في ستائرك الآن" : "Try Comfort... Control Your Blinds Now"}
            </h3>
            <p className="text-white/60 text-xs md:text-sm font-light">
              {isAr ? "احجز معاينة مجانية واكتشف حلول الستائر الذكية لمنزلك" : "Book a free measurement and discover smart curtain solutions for your home"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 z-10">
            <Link 
              href={`/${params.locale}/#reservation-section`}
              className="bg-[#d4af37] hover:bg-[#b8922a] text-[#2B1B17] font-bold px-6 py-3 rounded-xl text-center text-xs uppercase tracking-wider transition-colors shadow-md shadow-[#d4af37]/20"
            >
              {isAr ? "احجز معاينة مجانية" : "Book Free Measurement"}
            </Link>
            <a 
              href="https://wa.me/201100080609" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-[#FFFDFA]/20 hover:border-white hover:bg-white/5 text-white font-bold px-6 py-3 rounded-xl text-center text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              {isAr ? "تواصل واتساب" : "WhatsApp"}
            </a>
          </div>
        </div>

        {/* Section 5: Bottom Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border-t border-gray-100 pt-8 text-center text-xs text-gray-500 font-light">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37] text-2xl">verified</span>
            <span>{isAr ? "معاينة مجانية داخل القاهرة والجيزة" : "Free measurement inside Cairo & Giza"}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37] text-2xl">support_agent</span>
            <span>{isAr ? "خدمة ما بعد البيع ودعم فني دائم" : "After-sales service & tech support"}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37] text-2xl">handyman</span>
            <span>{isAr ? "تركيب احترافي بفريق متخصص" : "Professional install by expert team"}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37] text-2xl">hardware</span>
            <span>{isAr ? "قطع غيار أصلية 100%" : "100% original spare parts"}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37] text-2xl">security</span>
            <span>{isAr ? "ضمان حتى 10 سنوات على الموتور" : "Up to 10 years warranty on motor"}</span>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
