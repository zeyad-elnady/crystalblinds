import ProductCards from "./ProductCards";
import ReservationSection from "./ReservationSection";
import ModernHero from "./ModernHero";
import AboutUs from "./AboutUs";
import ClientsMarquee from "./ClientsMarquee";
import { getWebsiteImages } from "@/lib/images";
import { getProducts } from "@/lib/products";
import { getPartners } from "@/lib/partners";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const images = await getWebsiteImages();
  const products = await getProducts();
  const partners = await getPartners();

  return (
    <>
      {/* ── Modern Hero ── */}
      <section id="home" className="relative z-30">
        <ModernHero isAr={isAr} />
      </section>

      {/* ── Best Sellers ── */}
      <section id="products" className="relative bg-[#FFFDFA] text-[#3E2723] overflow-hidden flex flex-col py-0">
        {/* Decorative background elements */}
{/* Section heading */}
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center pt-16 md:pt-24 pb-8 px-6 shrink-0">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "الأكثر مبيعاً" : "Best Sellers"}
          </span>
          <h3 className="font-headline text-3xl md:text-4xl text-[#3E2723] mt-2">
            {isAr ? "اكتشف منتجاتنا المميزة" : "Discover Our Top Picks"}
          </h3>
          <p className="text-[#3E2723]/70 font-light mt-2 md:mt-3 tracking-wide text-sm md:text-base max-w-2xl mx-auto">
            {isAr
              ? "مجموعة من الستائر الأكثر طلباً التي تجمع بين الأناقة والعملية لتناسب كافة احتياجاتك."
              : "A selection of our most requested blinds that combine elegance and functionality for all your needs."}
          </p>
        </div>

        {/* Product Cards */}
        <div className="relative z-10 w-full">
          <ProductCards isAr={isAr} products={products} isBrief={true} />
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
      <ClientsMarquee isAr={isAr} partners={partners} />



      {/* ── Reservation Section ── */}
      <ReservationSection isAr={isAr} />
    </>
  );
}
