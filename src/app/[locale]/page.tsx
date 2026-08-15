import ReservationSection from "./ReservationSection";
import ModernHero from "./ModernHero";
import BlindTypes from "./BlindTypes";
import BeforeAfterSlider from "./BeforeAfterSlider";
import AboutUs from "./AboutUs";
import CurtainCalculator from "./CurtainCalculator";
import Testimonials from "./Testimonials";
import ClientsMarquee from "./ClientsMarquee";
import { getProducts, getFeaturedProducts } from "@/lib/products";
import { getPartners } from "@/lib/partners";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const products = await getProducts();
  const featuredProducts = await getFeaturedProducts();
  const partners = await getPartners();

  return (
    <>
      {/* ── Hero Section (with Floating Stats) ── */}
      <section id="home" className="relative z-30">
        <ModernHero isAr={isAr} />
      </section>

      {/* ── Discover Blind Types Section ── */}
      <section className="relative z-20">
        <BlindTypes isAr={isAr} locale={locale} products={featuredProducts} />
      </section>

      {/* ── Before & After Slider Section ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <BeforeAfterSlider isAr={isAr} />
      </section>

      {/* ── Why Choose Us Section (About Us & Founder Quote) ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <AboutUs isAr={isAr} />
      </section>

      {/* ── Curtain Price Calculator Section ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <CurtainCalculator isAr={isAr} products={products} />
      </section>

      {/* ── Customer Testimonials Section ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <Testimonials isAr={isAr} />
      </section>

      {/* ── Success Partners Clients Marquee Section ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <ClientsMarquee isAr={isAr} partners={partners} />
      </section>

      {/* ── Reservation / Booking Section (strictly preserved) ── */}
      <section className="relative z-20 bg-[#FFFDFA]">
        <ReservationSection isAr={isAr} />
      </section>
    </>
  );
}
