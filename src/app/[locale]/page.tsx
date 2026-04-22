import FabricCarousel from "./FabricCarousel";
import RollCurtainHero from "./RollCurtainHero";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <>
      {/* ── 2D Roll-Up Curtain Hero ── */}
      <section id="home">
        <RollCurtainHero isAr={isAr} />
      </section>

      {/* ── Collections ── */}
      <section id="collections" className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-on-secondary-container uppercase tracking-widest text-xs font-semibold">
              {isAr ? "لماذا نحن" : "Why Choose Us"}
            </span>
            <h3 className="font-headline text-3xl md:text-5xl mt-2 text-primary">
              {isAr ? "اختلاف يصنع التميز" : "The Al Mostaqbal Difference"}
            </h3>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 ${isAr ? "rtl" : ""}`}>
            {/* Item 1 */}
            <div className="md:col-span-7 group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-[#faf8f5]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Elegance and Design"
                  src="/photos for crystal/1.jpeg"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-headline text-2xl text-primary">{isAr ? "أناقة وتصميم" : "Elegance & Design"}</h4>
                <span className="h-[1px] flex-1 mx-4 bg-outline-variant/30 hidden md:block"></span>
                <span className="text-[#d4af37] font-bold text-sm">#01</span>
              </div>
              <p className="text-on-surface-variant mt-2 max-w-md">
                {isAr
                  ? "تصاميم عصرية تندمج بسلاسة مع أي ديكور داخلي لترتقي بجمال مساحتك."
                  : "Modern designs that seamlessly blend with any interior, elevating the aesthetic of your space."}
              </p>
            </div>
            
            {/* Item 2 */}
            <div className="md:col-span-5 md:mt-20 group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-[#faf8f5]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Professional Expertise"
                  src="/photos for crystal/2.jpeg"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-headline text-2xl text-primary">{isAr ? "خبرة واحترافية" : "Professional Expertise"}</h4>
                <span className="h-[1px] flex-1 mx-4 bg-outline-variant/30 hidden md:block"></span>
                <span className="text-[#d4af37] font-bold text-sm">#02</span>
              </div>
              <p className="text-on-surface-variant mt-2">
                {isAr
                  ? "عقود من الخبرة تضمن لك تنفيذاً وتركيباً خالياً من العيوب بواسطة فريقنا المتخصص."
                  : "Decades of experience ensuring flawless execution and installation by our dedicated team."}
              </p>
            </div>

            {/* Item 3 */}
            <div className="md:col-span-5 group cursor-pointer mt-8 md:mt-0">
              <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-[#faf8f5]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Premium Quality"
                  src="/photos for crystal/3.jpeg"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-headline text-2xl text-primary">{isAr ? "جودة استثنائية" : "Premium Quality"}</h4>
                <span className="h-[1px] flex-1 mx-4 bg-outline-variant/30 hidden md:block"></span>
                <span className="text-[#d4af37] font-bold text-sm">#03</span>
              </div>
              <p className="text-on-surface-variant mt-2">
                {isAr
                  ? "نختار فقط أجود الخامات، لنضمن لك المتانة والجمال الذي يدوم طويلاً."
                  : "We source only the finest materials, guaranteeing durability and long-lasting beauty."}
              </p>
            </div>

            {/* Item 4 */}
            <div className="md:col-span-7 md:mt-12 group cursor-pointer mt-8 md:mt-12">
              <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-[#faf8f5]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Smart Customization"
                  src="/photos for crystal/4.jpeg"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-headline text-2xl text-primary">{isAr ? "حلول ذكية مخصصة" : "Smart Customization"}</h4>
                <span className="h-[1px] flex-1 mx-4 bg-outline-variant/30 hidden md:block"></span>
                <span className="text-[#d4af37] font-bold text-sm">#04</span>
              </div>
              <p className="text-on-surface-variant mt-2 max-w-md">
                {isAr
                  ? "حلول مخصصة وأنظمة تحكم متطورة لتناسب أسلوب حياتك الفريد واحتياجاتك."
                  : "Tailored solutions and advanced automation to fit your unique lifestyle and needs."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className="bg-primary text-surface overflow-hidden h-screen min-h-[500px] flex flex-col py-0">
        {/* Section heading */}
        <div className="max-w-7xl mx-auto w-full text-center pt-8 md:pt-12 pb-4 px-6 shrink-0">
          <span className="text-[#d4af37]/80 text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "مجموعة المنتجات" : "Our Products"}
          </span>
          <h3 className="font-headline text-3xl md:text-4xl text-white mt-2">
            {isAr ? "حلول تغطية النوافذ" : "Window Covering Solutions"}
          </h3>
          <p className="text-white/70 font-light mt-2 md:mt-3 tracking-wide text-sm md:text-base max-w-xl mx-auto">
            {isAr
              ? "تصاميم مبتكرة وخامات متنوعة لتناسب كل مساحة واحتياج."
              : "Innovative designs and versatile materials for every space and need."}
          </p>
        </div>

        {/* Carousel */}
        <div className="flex-1 w-full flex flex-col justify-center pb-6 md:pb-8 min-h-0">
          <FabricCarousel isAr={isAr} />
        </div>
      </section>

      {/* ── Consult CTA ── */}
      <section id="consult" className="py-24 md:py-32 px-6 md:px-12 relative overflow-hidden bg-surface flex justify-center items-center">
        {/* Subtle background texture/lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          <div className="w-[1px] h-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        </div>
        
        {/* The Card */}
        <div className="relative z-10 w-full max-w-4xl border border-primary/10 bg-[#faf8f5] shadow-[0_20px_60px_-15px_rgba(38,23,12,0.05)] p-12 md:p-24 text-center flex flex-col items-center transition-all hover:shadow-[0_20px_60px_-15px_rgba(38,23,12,0.1)]">
          
          {/* Top accent */}
          <div className="mb-8 md:mb-10 flex items-center gap-6">
            <span className="w-12 md:w-16 h-[1px] bg-primary/20" />
            <span className="material-symbols-outlined text-[#d4af37] text-2xl md:text-3xl">
              star_rate
            </span>
            <span className="w-12 md:w-16 h-[1px] bg-primary/20" />
          </div>

          <h3 className="font-headline text-3xl md:text-5xl text-primary mb-6">
            {isAr ? "دعوة للتميز" : "An Invitation to Excellence"}
          </h3>
          
          <p className="font-body font-light text-on-surface-variant leading-relaxed text-base md:text-lg max-w-xl mx-auto mb-10 md:mb-12">
            {isAr
              ? "منذ عام ١٩٨٤، نصمم الأجواء في أرقى المنازل. فريقنا مستعد لتقديم استشارة خاصة لاختيار النسيج الأمثل لمساحتك."
              : "Since 1984, Crystal Blinds has been the quiet architect of atmosphere in the world's most prestigious homes."}
          </p>

          <a
            href="#contact"
            className="group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 bg-transparent overflow-hidden"
          >
            {/* Outline border */}
            <div className="absolute inset-0 border border-primary/30 transition-all duration-500 group-hover:border-primary group-hover:bg-primary" />
            
            <span className="relative z-10 text-primary font-bold tracking-[0.2em] uppercase text-xs md:text-sm group-hover:text-surface transition-colors duration-500 flex items-center gap-3">
              <span>{isAr ? "حجز استشارة خاصة" : "Request a Private Viewing"}</span>
              <span className={`material-symbols-outlined text-sm transition-transform duration-500 group-hover:translate-x-2 ${isAr ? "rotate-180 group-hover:-translate-x-2 group-hover:translate-x-0" : ""}`}>
                arrow_forward
              </span>
            </span>
          </a>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-surface">
        <div className={`max-w-7xl mx-auto ${isAr ? "text-right" : ""}`}>
          {/* Heading */}
          <div className="mb-16">
            <span className="text-on-secondary-container uppercase tracking-widest text-xs font-semibold">
              {isAr ? "تواصل معنا" : "Get in Touch"}
            </span>
            <h3 className="font-headline text-3xl md:text-5xl mt-2 text-primary">
              {isAr ? "نسعد بخدمتك" : "Let's Start a Conversation"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <form className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {isAr ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  id="contact-name"
                  placeholder={isAr ? "أدخل اسمك" : "Your name"}
                  className="bg-surface-container border border-outline-variant rounded-sm px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#26170c] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-phone" className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  placeholder={isAr ? "+966 5X XXX XXXX" : "+20 1X XXXX XXXX"}
                  className="bg-surface-container border border-outline-variant rounded-sm px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#26170c] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {isAr ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  id="contact-email"
                  placeholder={isAr ? "بريدك الإلكتروني" : "your@email.com"}
                  className="bg-surface-container border border-outline-variant rounded-sm px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#26170c] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  {isAr ? "رسالتك" : "Message"}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder={isAr ? "أخبرنا عن مشروعك..." : "Tell us about your space and vision..."}
                  className="bg-surface-container border border-outline-variant rounded-sm px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#26170c] transition-colors resize-none"
                />
              </div>
              <button
                id="contact-submit"
                type="submit"
                className="mt-2 bg-[#26170c] text-[#faf8f5] py-4 font-bold tracking-widest uppercase hover:bg-[#3d2b1f] transition-all shadow-md hover:scale-[1.01]"
              >
                {isAr ? "أرسل رسالتك" : "Send Message"}
              </button>
            </form>

            {/* Info Cards */}
            <div className="flex flex-col gap-8 justify-center">
              {/* Visit */}
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#26170c] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[#d4af37] text-[20px]">location_on</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                    {isAr ? "زيارة معرضنا" : "Visit Our Showroom"}
                  </p>
                  <p className="text-on-surface font-medium">
                    {isAr ? "١٢ شارع التحرير، القاهرة" : "12 El Tahrir Street, Cairo"}
                  </p>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {isAr ? "السبت – الخميس، ١٠ص – ٨م" : "Sat – Thu, 10 AM – 8 PM"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#26170c] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[#d4af37] text-[20px]">call</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                    {isAr ? "اتصل بنا" : "Call Us"}
                  </p>
                  <a href="tel:+201234567890" className="text-on-surface font-medium hover:text-[#26170c]/70 transition-colors">
                    +20 12 3456 7890
                  </a>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {isAr ? "نرد على مكالماتك خلال ٢٤ ساعة" : "We respond within 24 hours"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#26170c] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[#d4af37] text-[20px]">mail</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                    {isAr ? "راسلنا" : "Email Us"}
                  </p>
                  <a href="mailto:hello@crystalblinds.com" className="text-on-surface font-medium hover:text-[#26170c]/70 transition-colors">
                    hello@crystalblinds.com
                  </a>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {isAr ? "للمشاريع الخاصة والتعاون" : "For bespoke projects & partnerships"}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <div className="border-t border-outline-variant/30 pt-8 mt-2">
                <p className="font-headline italic text-on-surface-variant text-lg leading-relaxed">
                  {isAr
                    ? '"كل مساحة تستحق ستارةً تعكس روحها."'
                    : '"Every space deserves a curtain that reflects its soul."'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
