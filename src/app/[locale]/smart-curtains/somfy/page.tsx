import { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../PageHero";
import { getMotorProductsByBrand } from "@/lib/motorProducts";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'محركات Somfy الفرنسية | كريستال بليندز' : 'Somfy French Motors | Crystal Blinds',
    description: isAr
      ? 'اكتشف محركات Somfy الفرنسية للستائر الذكية بجودة عالمية وضمان حتى 10 سنوات'
      : 'Discover Somfy French motors for smart blinds with world-class quality and up to 10-year warranty',
  };
}

const SOMFY_FEATURES = [
  {
    icon: 'touch_app',
    titleAr: 'راحة قصوى',
    titleEn: 'Greater Convenience',
    descAr: 'تحكم في ستائرك بلمسة واحدة من أي مكان عبر الهاتف أو الريموت دون أي جهد.',
    descEn: 'Control your blinds with a single touch from anywhere via phone or remote, effortlessly.',
  },
  {
    icon: 'timer',
    titleAr: 'عمر افتراضي طويل',
    titleEn: 'Longer Lifespan',
    descAr: 'محركات سومفي مصممة لتدوم لسنوات طويلة بدون صيانة متكررة أو أعطال.',
    descEn: 'Somfy motors are engineered to last for years without frequent maintenance or breakdowns.',
  },
  {
    icon: 'bolt',
    titleAr: 'توفير الطاقة',
    titleEn: 'Energy Efficiency',
    descAr: 'تحكم ذكي في الضوء والحرارة يساعد في خفض فاتورة الكهرباء والتكييف.',
    descEn: 'Smart light and heat control helps reduce electricity and air conditioning bills.',
  },
  {
    icon: 'volume_mute',
    titleAr: 'صامت وأنيق',
    titleEn: 'Quiet & Discreet',
    descAr: 'محركات Somfy تعمل بهدوء تام خلف ستائرك دون أي ضجيج مزعج.',
    descEn: 'Somfy motors operate in total silence behind your curtains with zero noise.',
  },
];

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  zebra: { ar: 'ستائر زيبرا', en: 'Zebra Blinds' },
  sunscreen: { ar: 'ستائر صن سكرين', en: 'Sunscreen' },
  sunlight: { ar: 'ستائر صن لايت', en: 'Sunlight' },
  blackout: { ar: 'ستائر بلاك اوت', en: 'Blackout' },
  roman: { ar: 'ستائر رومان', en: 'Roman' },
  dream: { ar: 'ستائر دريم', en: 'Dream' },
  bamboo: { ar: 'ستائر بامبو', en: 'Bamboo' },
};

export default async function SomfyPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  const products = await getMotorProductsByBrand('somfy');

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <>
      <PageHero
        title={isAr ? 'محركات Somfy الفرنسية' : 'French Somfy Motors'}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? 'الرئيسية' : 'Home', href: `/${locale}` },
          { label: isAr ? 'الستائر الذكية' : 'Smart Curtains', href: `/${locale}/smart-curtains` },
          { label: 'Somfy' },
        ]}
      />

      {/* Brand Hero */}
      <section className={`pt-20 pb-16 px-6 md:px-12 bg-[#FFFDFA] ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-3">
                <span
                  className="font-black text-4xl md:text-5xl text-[#E05206]"
                  style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-1px' }}
                >
                  somfy.
                </span>
                <span className="bg-[#E05206]/10 text-[#E05206] text-xs font-bold px-3 py-1 rounded-full border border-[#E05206]/20">
                  {isAr ? 'فرنسية' : 'France'}
                </span>
              </div>
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] leading-snug">
                {isAr
                  ? 'أكثر من 50 عاماً من الابتكار في الستائر الذكية'
                  : 'Over 50 Years of Innovation in Smart Blinds'}
              </h1>
              <div className="w-12 h-[2px] bg-[#E05206]" />
              <p className="text-[#3E2723]/70 text-sm md:text-base leading-relaxed">
                {isAr
                  ? 'تُعدّ Somfy الشركة الرائدة عالمياً في حلول التشغيل الآلي للنوافذ والأبواب والستائر. تعمل في 57 دولة وتوفّر أحدث تقنيات التحكم عن بُعد، والمنزل الذكي، والطاقة الموفّرة — كل ذلك بتصنيع فرنسي موثوق.'
                  : 'Somfy is the world leader in motorized solutions for windows, doors and blinds. Operating in 57 countries, it delivers cutting-edge remote control, smart home and energy-saving technologies — all with trusted French manufacturing.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/201100080609?text=مهتم بمحركات Somfy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#E05206] hover:bg-[#c94605] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-[#E05206]/20"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  {isAr ? 'استفسر الآن' : 'Enquire Now'}
                </a>
                <Link
                  href={`/${locale}/#reservation-section`}
                  className="inline-flex items-center gap-2 border-2 border-[#3E2723]/20 hover:border-[#d4af37] text-[#3E2723] hover:text-[#d4af37] font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  {isAr ? 'احجز معاينة مجانية' : 'Book Free Measurement'}
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#E05206]/5 to-[#3E2723]/5 border border-[#E05206]/10 p-10 flex flex-col items-center justify-center gap-6">
                <div className="w-28 h-28 rounded-full bg-[#E05206]/10 border-2 border-[#E05206]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#E05206] text-6xl">precision_manufacturing</span>
                </div>
                <div className={`grid grid-cols-2 gap-3 w-full ${isAr ? 'text-right' : 'text-left'}`}>
                  {[
                    { num: '57', label: isAr ? 'دولة' : 'Countries' },
                    { num: '50+', label: isAr ? 'سنة خبرة' : 'Years Experience' },
                    { num: '270M+', label: isAr ? 'محرك مُركَّب' : 'Motors Installed' },
                    { num: '10', label: isAr ? 'سنوات ضمان' : 'Year Warranty' },
                  ].map((stat) => (
                    <div key={stat.num} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                      <div className="text-2xl font-black text-[#E05206]">{stat.num}</div>
                      <div className="text-xs text-gray-500 mt-1 font-light">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#E05206]/8 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#d4af37]/8 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Somfy Features */}
      <section className={`py-16 px-6 md:px-12 bg-white border-t border-gray-100 ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#E05206] text-xs uppercase tracking-[0.3em] font-semibold">
              {isAr ? 'لماذا Somfy؟' : 'WHY SOMFY?'}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mt-2">
              {isAr ? 'مميزات تجعلها الأفضل' : 'Features That Make It the Best'}
            </h2>
            <div className="w-14 h-[2px] bg-[#E05206] mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOMFY_FEATURES.map((feat, i) => (
              <div
                key={i}
                className="group relative bg-[#FFFDFA] border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E05206]/40 to-[#d4af37]/40 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-[#E05206]/8 border border-[#E05206]/15 flex items-center justify-center text-[#E05206] group-hover:bg-[#E05206] group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                </div>
                <h3 className="font-bold text-sm text-[#3E2723]">{isAr ? feat.titleAr : feat.titleEn}</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-light">{isAr ? feat.descAr : feat.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className={`py-16 px-6 md:px-12 bg-[#FFFDFA] border-t border-gray-100 ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#E05206] text-xs uppercase tracking-[0.3em] font-semibold">
              {isAr ? 'منتجاتنا' : 'OUR PRODUCTS'}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mt-2">
              {isAr ? 'محركات ومنتجات Somfy' : 'Somfy Motors & Products'}
            </h2>
            <div className="w-14 h-[2px] bg-[#E05206] mx-auto mt-3" />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 gap-3">
              <span className="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
              <p className="text-sm">{isAr ? 'لا توجد منتجات حالياً' : 'No products yet'}</p>
            </div>
          ) : (
            <>
              {categories.map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
                const catLabel = CATEGORY_LABELS[cat]?.[isAr ? 'ar' : 'en'] || cat;
                return (
                  <div key={cat} className="mb-14">
                    <div className={`flex items-center gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="h-[2px] flex-1 bg-gray-100" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#E05206] px-3 py-1 bg-[#E05206]/8 rounded-full border border-[#E05206]/20">
                        {catLabel}
                      </span>
                      <div className="h-[2px] flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {catProducts.map(product => (
                        <div
                          key={product.id}
                          className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={isAr ? product.nameAr : product.nameEn}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-gray-200">precision_manufacturing</span>
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className="bg-[#E05206] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                somfy
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className={`p-5 space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
                            <h3 className="font-bold text-sm text-[#3E2723] leading-snug line-clamp-2">
                              {isAr ? product.nameAr : product.nameEn}
                            </h3>
                            {(isAr ? product.descAr : product.descEn) && (
                              <p className="text-gray-400 text-[11px] leading-relaxed font-light line-clamp-2">
                                {isAr ? product.descAr : product.descEn}
                              </p>
                            )}
                            <div className={`flex items-center justify-between gap-2 pt-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                              <span className="font-black text-base text-[#3E2723]">
                                {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                <span className="text-xs font-normal text-gray-400 ml-1">{isAr ? 'ج.م' : 'EGP'}</span>
                              </span>
                              <a
                                href={`https://wa.me/201100080609?text=${encodeURIComponent(`مهتم بـ ${product.nameAr}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#E05206] border border-[#E05206]/30 px-3 py-1.5 rounded-lg hover:bg-[#E05206] hover:text-white transition-all"
                              >
                                {isAr ? 'اطلب الآن' : 'Order'}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={`py-16 px-6 md:px-12 bg-[#2B1B17] ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="material-symbols-outlined text-[#E05206] text-5xl block">settings_remote</span>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white">
            {isAr ? 'جاهز لتجربة الراحة الحقيقية؟' : 'Ready to Experience True Comfort?'}
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            {isAr
              ? 'احجز معاينة مجانية اليوم وسيقوم فريقنا بزيارتك لتقديم عرض متكامل لمحركات Somfy.'
              : 'Book a free visit today and our team will come to you with a complete Somfy motor demonstration.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/#reservation-section`}
              className="bg-[#E05206] hover:bg-[#c94605] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#E05206]/20"
            >
              {isAr ? 'احجز معاينة مجانية' : 'Book Free Measurement'}
            </Link>
            <a
              href="https://wa.me/201100080609"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-white text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
