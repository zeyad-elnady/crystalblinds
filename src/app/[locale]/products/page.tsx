import ProductCards from "../ProductCards";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'منتجاتنا | كريستال بليندز' : 'Our Products | Crystal Blinds',
    description: locale === 'ar' ? 'تصفح مجموعة كريستال بليندز من الستائر والشادر الفاخرة.' : 'Browse Crystal Blinds premium curtains and window treatments.',
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#faf8f5] text-[#26170c] pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>
        <div className={`relative z-10 max-w-7xl mx-auto ${isAr ? 'text-right' : ''}`}>
          <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
            {isAr ? 'مجموعتنا' : 'Our Collection'}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-[#26170c] leading-tight">
            {isAr ? 'منتجاتنا' : 'Our'} <span className="text-[#d4af37] italic font-light">{isAr ? '' : 'Products'}</span>
          </h1>
          <p className="text-[#26170c]/60 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
            {isAr
              ? 'اكتشف مجموعتنا الكاملة من الستائر الفاخرة — من الرول إلى الزيبرا والمطبوع، لكل مساحة حل مثالي.'
              : 'Explore our full range of premium window treatments — from blackout to zebra and custom printed, a perfect solution for every space.'}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[#faf8f5] relative overflow-hidden py-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#e9c176]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center pt-12 pb-4 px-6">
          <p className="text-[#26170c]/60 text-sm max-w-2xl mx-auto">
            {isAr
              ? 'اضغط على أي منتج لعرض التفاصيل وطلب معاينة مجانية'
              : 'Click any product to view details and request a free consultation'}
          </p>
        </div>
        <div className="relative z-10 w-full">
          <ProductCards isAr={isAr} />
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 px-6 md:px-12 bg-[#faf8f5] text-center relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#d4af37]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl text-[#26170c] mb-4">
            {isAr ? 'لم تجد ما تبحث عنه؟' : "Didn't find what you're looking for?"}
          </h2>
          <p className="text-[#26170c]/60 text-sm mb-8">
            {isAr ? 'تواصل معنا للحصول على حل مخصص يناسب احتياجاتك تماماً.' : 'Contact us for a custom solution perfectly tailored to your needs.'}
          </p>
          <a href={`/${locale}/contact`}
            className="inline-flex items-center gap-3 bg-[#d4af37] text-[#26170c] px-8 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#e9c176] transition-colors shadow-lg">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
            <span className={`material-symbols-outlined text-base ${isAr ? 'rotate-180' : ''}`}>arrow_forward</span>
          </a>
        </div>
      </section>
    </>
  );
}
