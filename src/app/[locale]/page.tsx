import ProductCards from "./ProductCards";
import ReservationSection from "./ReservationSection";
import ModernHero from "./ModernHero";
import WhyChooseUsParallax from "./WhyChooseUsParallax";
import AboutUs from "./AboutUs";
import ClientsMarquee from "./ClientsMarquee";
import { getWebsiteImages } from "@/lib/images";
import { getProducts } from "@/lib/products";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const images = await getWebsiteImages();
  const products = await getProducts();

  return (
    <>
      {/* ── Modern Hero ── */}
      <section id="home" className="relative z-30">
        <ModernHero isAr={isAr} />
      </section>

      {/* ── Why Choose Us ── */}
      <WhyChooseUsParallax isAr={isAr} />

      {/* ── Best Sellers ── */}
      <section id="products" className="relative bg-[#faf8f5] text-[#6A311D] overflow-hidden flex flex-col py-0">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#e9c176]/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Section heading */}
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center pt-16 md:pt-24 pb-8 px-6 shrink-0">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "الأكثر مبيعاً" : "Best Sellers"}
          </span>
          <h3 className="font-headline text-3xl md:text-4xl text-[#6A311D] mt-2">
            {isAr ? "اكتشف منتجاتنا المميزة" : "Discover Our Top Picks"}
          </h3>
          <p className="text-[#6A311D]/70 font-light mt-2 md:mt-3 tracking-wide text-sm md:text-base max-w-2xl mx-auto">
            {isAr
              ? "مجموعة من الستائر الأكثر طلباً التي تجمع بين الأناقة والعملية لتناسب كافة احتياجاتك."
              : "A selection of our most requested blinds that combine elegance and functionality for all your needs."}
          </p>
        </div>

        {/* Product Cards */}
        <div className="relative z-10 w-full">
          <ProductCards isAr={isAr} products={products} />
        </div>

        {/* View All Button */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-center pb-16">
          <a
            href={`/${locale}/products`}
            className="group flex items-center gap-3 bg-transparent border-2 border-[#d4af37] text-[#d4af37] px-8 py-3 rounded hover:bg-[#d4af37] hover:text-white transition-all duration-300 font-semibold tracking-widest uppercase text-sm shadow-md"
          >
            <span>{isAr ? "عرض كل المنتجات" : "View All Products"}</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isAr ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
              arrow_forward
            </span>
          </a>
        </div>
      </section>

      {/* ── About Us ── */}
      <AboutUs isAr={isAr} />

      {/* ── Clients Marquee ── */}
      <ClientsMarquee isAr={isAr} />



      {/* ── Reservation Section ── */}
      <ReservationSection isAr={isAr} />
    </>
  );
}
