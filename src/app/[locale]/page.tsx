import ProductCards from "./ProductCards";
import ReservationSection from "./ReservationSection";
import ModernHero from "./ModernHero";
import AboutUs from "./AboutUs";
import ClientsMarquee from "./ClientsMarquee";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <>
      {/* ── Modern Hero ── */}
      <section id="home" className="relative z-30">
        <ModernHero isAr={isAr} />
      </section>

      {/* ── Why Choose Us ── */}
      <section id="collections" className="py-24 md:py-32 px-6 md:px-12 bg-[#faf8f5] relative overflow-hidden z-20">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#e9c176]/20 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className={`mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 ${isAr ? "text-right" : ""}`}>
            <div className="max-w-3xl">
              <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
                {isAr ? "لماذا نحن" : "Why Choose Us"}
              </span>
              <h3 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#6A311D] leading-tight">
                {isAr ? "اختلاف كريستال للستائر" : "The Crystal Blinds"} <br className="hidden md:block" />
                <span className="text-[#d4af37] italic font-light">{isAr ? "" : "Difference"}</span>
              </h3>
            </div>
            <p className="text-[#6A311D]/70 text-sm md:text-base max-w-sm leading-relaxed pb-2">
              {isAr
                ? "نحن لا نبيع ستائر فقط، بل نصنع تجربة متكاملة من الأناقة والاحترافية لتلبي ذوقك الرفيع."
                : "We don't just sell blinds; we craft a complete experience of elegance and professionalism tailored to your refined taste."}
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 ${isAr ? "rtl" : ""}`}>
            {/* Item 1 */}
            <div className="group relative bg-white/60 border border-white/50 rounded-2xl p-8 md:p-12 overflow-hidden hover:bg-white/80 transition-all duration-500 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#6A311D]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                01
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#6A311D]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">diamond</span>
                </div>
                <h4 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "أناقة وتصميم" : "Elegance & Design"}</h4>
                <p className="text-[#6A311D]/70 leading-relaxed text-sm">
                  {isAr
                    ? "تصاميم عصرية تندمج بسلاسة مع أي ديكور داخلي لترتقي بجمال مساحتك."
                    : "Modern designs that seamlessly blend with any interior, elevating the aesthetic of your space."}
                </p>
              </div>
              <div className="mt-10 rounded-xl overflow-hidden aspect-[16/9] shadow-md">
                <img src="/photos for crystal/1.jpeg" alt="Elegance" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Item 2 */}
            <div className="group relative bg-white/60 border border-white/50 rounded-2xl p-8 md:p-12 overflow-hidden hover:bg-white/80 transition-all duration-500 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] hover:shadow-2xl md:translate-y-12">
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#6A311D]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                02
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#6A311D]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">workspace_premium</span>
                </div>
                <h4 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "خبرة واحترافية" : "Professional Expertise"}</h4>
                <p className="text-[#6A311D]/70 leading-relaxed text-sm">
                  {isAr
                    ? "عقود من الخبرة تضمن لك تنفيذاً وتركيباً خالياً من العيوب بواسطة فريقنا المتخصص."
                    : "Decades of experience ensuring flawless execution and installation by our dedicated team."}
                </p>
              </div>
              <div className="mt-10 rounded-xl overflow-hidden aspect-[16/9] shadow-md">
                <img src="/photos for crystal/2.jpeg" alt="Expertise" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Item 3 */}
            <div className="group relative bg-white/60 border border-white/50 rounded-2xl p-8 md:p-12 overflow-hidden hover:bg-white/80 transition-all duration-500 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#6A311D]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                03
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#6A311D]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">verified</span>
                </div>
                <h4 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "جودة استثنائية" : "Premium Quality"}</h4>
                <p className="text-[#6A311D]/70 leading-relaxed text-sm">
                  {isAr
                    ? "نختار فقط أجود الخامات، لنضمن لك المتانة والجمال الذي يدوم طويلاً."
                    : "We source only the finest materials, guaranteeing durability and long-lasting beauty."}
                </p>
              </div>
              <div className="mt-10 rounded-xl overflow-hidden aspect-[16/9] shadow-md">
                <img src="/photos for crystal/3.jpeg" alt="Quality" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Item 4 */}
            <div className="group relative bg-white/60 border border-white/50 rounded-2xl p-8 md:p-12 overflow-hidden hover:bg-white/80 transition-all duration-500 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] hover:shadow-2xl md:translate-y-12">
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#6A311D]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                04
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#6A311D]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">tune</span>
                </div>
                <h4 className="font-headline text-2xl text-[#6A311D] mb-4">{isAr ? "حلول ذكية مخصصة" : "Smart Customization"}</h4>
                <p className="text-[#6A311D]/70 leading-relaxed text-sm">
                  {isAr
                    ? "حلول مخصصة وأنظمة تحكم متطورة لتناسب أسلوب حياتك الفريد واحتياجاتك."
                    : "Tailored solutions and advanced automation to fit your unique lifestyle and needs."}
                </p>
              </div>
              <div className="mt-10 rounded-xl overflow-hidden aspect-[16/9] shadow-md">
                <img src="/photos for crystal/4.jpeg" alt="Smart" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <ProductCards isAr={isAr} />
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
