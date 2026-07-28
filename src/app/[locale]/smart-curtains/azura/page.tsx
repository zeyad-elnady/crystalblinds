import { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../PageHero";
import { getMotorProductsByBrand } from "@/lib/motorProducts";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'محركات Azura التركية | كريستال بليندز' : 'Azura Turkish Motors | Crystal Blinds',
    description: isAr
      ? 'اكتشف محركات Azura التركية للستائر الذكية بتقنيات متقدمة وتصميم أنيق يناسب جميع المساحات'
      : 'Discover Azura Turkish motors for smart blinds with advanced technology and elegant design for all spaces',
  };
}

const AZURA_FEATURES = [
  {
    icon: 'speed',
    titleAr: 'أداء فائق',
    titleEn: 'Superior Performance',
    descAr: 'محركات قوية تحرك الستائر الثقيلة بسلاسة تامة في جميع الأوقات.',
    descEn: 'Powerful motors move heavy blinds with total smoothness at all times.',
  },
  {
    icon: 'hearing_disabled',
    titleAr: 'عمل هادئ',
    titleEn: 'Silent Operation',
    descAr: 'تقنية DC المتقدمة تضمن تشغيل هادئاً تماماً حتى في أكثر الأوقات هدوءاً.',
    descEn: 'Advanced DC technology ensures completely silent operation even in the quietest moments.',
  },
  {
    icon: 'build_circle',
    titleAr: 'سهولة التركيب',
    titleEn: 'Easy Installation',
    descAr: 'تصميم مبتكر يجعل عملية التركيب سريعة واحترافية مع إمكانية ضبط اللمتات بدقة.',
    descEn: 'Innovative design makes installation fast and professional with precise limit adjustment.',
  },
  {
    icon: 'devices',
    titleAr: 'توافق شامل',
    titleEn: 'Wide Compatibility',
    descAr: 'متوافق مع ريموت كنترول لاسلكي، مفاتيح جدارية، والتحكم عبر التطبيق الذكي.',
    descEn: 'Compatible with wireless remotes, wall switches, and smartphone app control.',
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

export default async function AzuraPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  const products = await getMotorProductsByBrand('azura');
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <>
      <PageHero
        title={isAr ? 'محركات Azura التركية' : 'Turkish Azura Motors'}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? 'الرئيسية' : 'Home', href: `/${locale}` },
          { label: isAr ? 'الستائر الذكية' : 'Smart Curtains', href: `/${locale}/smart-curtains` },
          { label: 'Azura' },
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
                  className="font-black text-4xl md:text-5xl text-[#0066b2]"
                  style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-1px' }}
                >
                  AZURA
                </span>
                <span className="bg-[#0066b2]/10 text-[#0066b2] text-xs font-bold px-3 py-1 rounded-full border border-[#0066b2]/20">
                  {isAr ? 'تركية' : 'Turkey'}
                </span>
              </div>
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] leading-snug">
                {isAr
                  ? 'قوة التقنية التركية في خدمة راحتك'
                  : 'The Power of Turkish Technology at Your Service'}
              </h1>
              <div className="w-12 h-[2px] bg-[#0066b2]" />
              <p className="text-[#3E2723]/70 text-sm md:text-base leading-relaxed">
                {isAr
                  ? 'تتميز Azura في تقديم مواتير قوية وهادئة بتقنيات DC متقدمة وتصميم أنيق يناسب جميع المساحات. تُعدّ الخيار الأمثل للمشاريع الكبيرة والسكنية على حد سواء، بأسعار تنافسية وجودة لا تُنافَس.'
                  : 'Azura excels in delivering powerful and quiet motors with advanced DC technology and elegant design for all spaces. The ideal choice for large and residential projects alike, with competitive prices and unmatched quality.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/201100080609?text=مهتم بمحركات Azura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0066b2] hover:bg-[#004d87] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-[#0066b2]/20"
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
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0066b2]/5 to-[#3E2723]/5 border border-[#0066b2]/10 p-10 flex flex-col items-center justify-center gap-6">
                <div className="w-28 h-28 rounded-full bg-[#0066b2]/10 border-2 border-[#0066b2]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#0066b2] text-6xl">settings_input_component</span>
                </div>
                <div className={`grid grid-cols-2 gap-3 w-full ${isAr ? 'text-right' : 'text-left'}`}>
                  {[
                    { num: 'DC', label: isAr ? 'تقنية متطورة' : 'Advanced Tech' },
                    { num: '5+', label: isAr ? 'سنوات ضمان' : 'Year Warranty' },
                    { num: '4m', label: isAr ? 'أقصى عرض' : 'Max Width' },
                    { num: '24/7', label: isAr ? 'دعم فني' : 'Tech Support' },
                  ].map((stat) => (
                    <div key={stat.num} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                      <div className="text-2xl font-black text-[#0066b2]">{stat.num}</div>
                      <div className="text-xs text-gray-500 mt-1 font-light">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#0066b2]/8 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#d4af37]/8 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-16 px-6 md:px-12 bg-white border-t border-gray-100 ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#0066b2] text-xs uppercase tracking-[0.3em] font-semibold">
              {isAr ? 'لماذا Azura؟' : 'WHY AZURA?'}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mt-2">
              {isAr ? 'تقنية تركية فائقة الجودة' : 'Superior Turkish Engineering'}
            </h2>
            <div className="w-14 h-[2px] bg-[#0066b2] mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AZURA_FEATURES.map((feat, i) => (
              <div
                key={i}
                className="group relative bg-[#FFFDFA] border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066b2]/40 to-[#d4af37]/40 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-[#0066b2]/8 border border-[#0066b2]/15 flex items-center justify-center text-[#0066b2] group-hover:bg-[#0066b2] group-hover:text-white transition-all duration-300">
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
            <span className="text-[#0066b2] text-xs uppercase tracking-[0.3em] font-semibold">
              {isAr ? 'منتجاتنا' : 'OUR PRODUCTS'}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723] mt-2">
              {isAr ? 'محركات ومنتجات Azura' : 'Azura Motors & Products'}
            </h2>
            <div className="w-14 h-[2px] bg-[#0066b2] mx-auto mt-3" />
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
                      <span className="text-xs font-bold uppercase tracking-widest text-[#0066b2] px-3 py-1 bg-[#0066b2]/8 rounded-full border border-[#0066b2]/20">
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
                                <span className="material-symbols-outlined text-6xl text-gray-200">settings_input_component</span>
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className="bg-[#0066b2] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                azura
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
                                className="text-xs font-bold text-[#0066b2] border border-[#0066b2]/30 px-3 py-1.5 rounded-lg hover:bg-[#0066b2] hover:text-white transition-all"
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
          <span className="material-symbols-outlined text-[#0066b2] text-5xl block">settings_input_component</span>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white">
            {isAr ? 'هل أنت مستعد للترقية الذكية؟' : 'Ready for a Smart Upgrade?'}
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            {isAr
              ? 'اكتشف الفرق مع محركات Azura — قوة تركية وهدوء مطلق بسعر تنافسي.'
              : 'Discover the difference with Azura motors — Turkish power and absolute silence at a competitive price.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/#reservation-section`}
              className="bg-[#0066b2] hover:bg-[#004d87] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#0066b2]/20"
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
