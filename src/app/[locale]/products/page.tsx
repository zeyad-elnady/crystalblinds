import ProductCards from "../ProductCards";
import { getProducts, getCategories } from "@/lib/products";
import PageHero from "../PageHero";

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
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <>
      {/* Hero Banner */}
      <PageHero
        title={isAr ? "منتجاتنا" : "Our Products"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "منتجاتنا" : "Our Products" },
        ]}
      />

      {/* Products Grid */}
      <section className="bg-[#FFFDFA] relative overflow-hidden py-0">
<div className="relative z-10 max-w-7xl mx-auto w-full text-center pt-12 pb-4 px-6">
          <p className="text-[#3E2723]/60 text-sm max-w-2xl mx-auto">
            {isAr
              ? 'اضغط على أي منتج لعرض التفاصيل وطلب معاينة مجانية'
              : 'Click any product to view details and request a free consultation'}
          </p>
        </div>
        <div className="relative z-10 w-full">
          <ProductCards isAr={isAr} products={products} categories={categories} />
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 px-6 md:px-12 bg-[#FFFDFA] text-center relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
        <div className="absolute inset-0 pointer-events-none">
</div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl text-[#3E2723] mb-4">
            {isAr ? 'لم تجد ما تبحث عنه؟' : "Didn't find what you're looking for?"}
          </h2>
          <p className="text-[#3E2723]/60 text-sm mb-8">
            {isAr ? 'تواصل معنا للحصول على حل مخصص يناسب احتياجاتك تماماً.' : 'Contact us for a custom solution perfectly tailored to your needs.'}
          </p>
          <a href={`/${locale}/contact`}
            className="inline-flex items-center gap-3 bg-[#d4af37] text-[#3E2723] px-8 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-[#e9c176] transition-colors shadow-lg">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
            <span className={`material-symbols-outlined text-base ${isAr ? 'rotate-180' : ''}`}>arrow_forward</span>
          </a>
        </div>
      </section>
    </>
  );
}
