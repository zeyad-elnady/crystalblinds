import ProjectsGallery from "./ProjectsGallery";
import Link from "next/link";
import PageHero from "../PageHero";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'مشاريعنا | كريستال بليندز' : 'Our Projects | Crystal Blinds',
    description: locale === 'ar'
      ? 'استعرض سابقة أعمالنا المنفذة من الستائر الفاخرة والأنظمة الذكية في مصر.'
      : 'Browse our portfolio of luxury blinds and smart motorized curtain installations in Egypt.',
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <>
      {/* ═══ Page Hero ═══ */}
      <PageHero
        title={isAr ? "مشاريعنا" : "Our Projects"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "مشاريعنا" : "Our Projects" },
        ]}
      />

      {/* ═══ Projects Gallery Section ═══ */}
      <section className="py-20 px-6 md:px-12 bg-[#FFFDFA]">
        <div className="max-w-7xl mx-auto">
          <ProjectsGallery isAr={isAr} />
        </div>
      </section>

      {/* ═══ CTA / Consult Section ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#3E2723] text-white overflow-hidden text-center border-t-2 border-[#d4af37]/20">
        {/* Background image fade */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <img src="/hero_bg.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-10 bg-[#3E2723]/95 pointer-events-none" />

        <div className="relative z-20 max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl md:text-5xl font-bold mb-6">
            {isAr ? 'لديك مشروع تجاري أو سكني جديد؟' : 'Have a New Residential or Commercial Project?'}
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-10 max-w-xl mx-auto">
            {isAr
              ? 'نحن متخصصون في تجهيز الشركات، المكاتب، الفيلات، والمستشفيات بأفضل أنواع الستائر بمواصفات أمان ووقاية عالمية.'
              : 'We specialize in furnishing corporations, offices, villas, and hospitals with premium blinds meeting top-grade global safety specifications.'}
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
              {isAr ? 'تواصل معنا الآن' : 'Contact Sales'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
