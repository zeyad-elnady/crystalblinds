import ProductCards from "./ProductCards";
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
              <h3 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#26170c] leading-tight">
                {isAr ? "اختلاف كريستال للستائر" : "The Crystal Blinds"} <br className="hidden md:block" />
                <span className="text-[#d4af37] italic font-light">{isAr ? "" : "Difference"}</span>
              </h3>
            </div>
            <p className="text-[#26170c]/70 text-sm md:text-base max-w-sm leading-relaxed pb-2">
              {isAr
                ? "نحن لا نبيع ستائر فقط، بل نصنع تجربة متكاملة من الأناقة والاحترافية لتلبي ذوقك الرفيع."
                : "We don't just sell blinds; we craft a complete experience of elegance and professionalism tailored to your refined taste."}
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 ${isAr ? "rtl" : ""}`}>
            {/* Item 1 */}
            <div className="group relative bg-white/60 border border-white/50 rounded-2xl p-8 md:p-12 overflow-hidden hover:bg-white/80 transition-all duration-500 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#26170c]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                01
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#26170c]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">diamond</span>
                </div>
                <h4 className="font-headline text-2xl text-[#26170c] mb-4">{isAr ? "أناقة وتصميم" : "Elegance & Design"}</h4>
                <p className="text-[#26170c]/70 leading-relaxed text-sm">
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
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#26170c]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                02
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#26170c]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">workspace_premium</span>
                </div>
                <h4 className="font-headline text-2xl text-[#26170c] mb-4">{isAr ? "خبرة واحترافية" : "Professional Expertise"}</h4>
                <p className="text-[#26170c]/70 leading-relaxed text-sm">
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
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#26170c]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                03
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#26170c]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">verified</span>
                </div>
                <h4 className="font-headline text-2xl text-[#26170c] mb-4">{isAr ? "جودة استثنائية" : "Premium Quality"}</h4>
                <p className="text-[#26170c]/70 leading-relaxed text-sm">
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
              <div className="absolute -top-10 -right-10 text-[150px] font-headline font-bold text-[#26170c]/[0.02] group-hover:text-[#d4af37]/10 transition-colors duration-500 pointer-events-none leading-none select-none">
                04
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full border border-[#26170c]/10 flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-500 bg-white/50 shadow-sm">
                  <span className="material-symbols-outlined text-[#d4af37] text-3xl">tune</span>
                </div>
                <h4 className="font-headline text-2xl text-[#26170c] mb-4">{isAr ? "حلول ذكية مخصصة" : "Smart Customization"}</h4>
                <p className="text-[#26170c]/70 leading-relaxed text-sm">
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

      {/* ── Products ── */}
      <section id="products" className="relative bg-[#faf8f5] text-[#26170c] overflow-hidden flex flex-col py-0">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#e9c176]/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Section heading */}
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center pt-16 md:pt-24 pb-8 px-6 shrink-0">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "مجموعة المنتجات" : "Our Products"}
          </span>
          <h3 className="font-headline text-3xl md:text-4xl text-[#26170c] mt-2">
            {isAr ? "حلول مصممة خصيصًا لك" : "Tailored Solutions for You"}
          </h3>
          <p className="text-[#26170c]/70 font-light mt-2 md:mt-3 tracking-wide text-sm md:text-base max-w-2xl mx-auto">
            {isAr
              ? "لكل نافذة وواجهة كبيرة كانت أو صغيرة. لا نكتفي بتركيب الستائر فحسب، بل نُقدّم خدمة طباعة الستائر حسب الطلب."
              : "For every window and facade, large or small. We don't just install blinds; we offer custom curtain printing services to meet your unique needs."}
          </p>
        </div>

        {/* Product Cards */}
        <div className="relative z-10 w-full">
          <ProductCards isAr={isAr} />
        </div>
      </section>

      {/* ── About Us ── */}
      <AboutUs isAr={isAr} />

      {/* ── Clients Marquee ── */}
      <ClientsMarquee isAr={isAr} />



      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-[#faf8f5] text-[#26170c] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e9c176]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className={`max-w-7xl mx-auto relative z-10 ${isAr ? "text-right" : ""}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Left: Info */}
            <div className="flex flex-col justify-center">
              <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-4">
                {isAr ? "تواصل معنا" : "Get in Touch"}
              </span>
              <h3 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#26170c] mb-6 leading-tight">
                {isAr ? "دعنا نبدأ" : "Let's Start a"} <br />
                <span className="text-[#d4af37] italic font-light">{isAr ? "محادثة" : "Conversation"}</span>
              </h3>
              <p className="text-[#26170c]/70 text-sm md:text-base max-w-md leading-relaxed mb-12">
                {isAr
                  ? "سواء كنت تصمم منزلاً جديداً أو تجدد مساحتك الحالية، فريقنا هنا لتقديم استشارة مخصصة تلبي تطلعاتك."
                  : "Whether you're designing a new home or refreshing your current space, our team is here to provide tailored advice for your vision."}
              </p>

              <div className="flex flex-col gap-8">
                {/* Visit */}
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-[20px]">location_on</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">
                      {isAr ? "زيارة معرضنا" : "Visit Our Showroom"}
                    </p>
                    <p className="text-[#26170c] font-medium text-sm md:text-base">
                      {isAr ? "شبرآ الخيمة، 74 شارع 15 مايو، أمام مجمع الصوالحة الإسلامي" : "Shubra El Kheima, 74 15 May Street, in front of El Sawalha Islamic Complex"}
                    </p>
                    <p className="text-[#26170c]/50 text-xs mt-1">
                      {isAr ? "السبت – الخميس، ١٠ص – ٨م" : "Sat – Thu, 10 AM – 8 PM"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-[20px]">call</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">
                      {isAr ? "اتصل بنا" : "Call Us"}
                    </p>
                    <a href="tel:01100080609" className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#d4af37] transition-colors">
                      01100080609 - 01020909498
                    </a>
                    <p className="text-[#26170c]/50 text-xs mt-1">
                      {isAr ? "نرد على مكالماتك خلال ٢٤ ساعة" : "We respond within 24 hours"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-[20px]">mail</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">
                      {isAr ? "راسلنا" : "Email Us"}
                    </p>
                    <a href="mailto:sales@crystalblinds.com" className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#d4af37] transition-colors">
                      sales@crystalblinds.com
                    </a>
                    <p className="text-[#26170c]/50 text-xs mt-1">
                      {isAr ? "للمشاريع الخاصة والتعاون" : "For bespoke projects & partnerships"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              {/* Form Card */}
              <div className="bg-white/60 border border-white/40 rounded-2xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_40px_rgba(38,23,12,0.05)]">
                <form className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? "الاسم الكامل" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      placeholder={isAr ? "أدخل اسمك" : "John Doe"}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-phone" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? "رقم الهاتف" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      placeholder={isAr ? "+966 5X XXX XXXX" : "+20 1X XXXX XXXX"}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? "البريد الإلكتروني" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      placeholder={isAr ? "بريدك الإلكتروني" : "john@example.com"}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-message" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? "رسالتك" : "Your Message"}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder={isAr ? "أخبرنا عن مشروعك..." : "Tell us about your space and vision..."}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm resize-none"
                    />
                  </div>

                  <button
                    id="contact-submit"
                    type="submit"
                    className="mt-4 flex items-center justify-center gap-3 bg-[#26170c] text-[#faf8f5] py-4 rounded font-bold tracking-widest uppercase text-xs hover:bg-[#3d2b1f] transition-colors shadow-lg"
                  >
                    <span>{isAr ? "أرسل رسالتك" : "Send Message"}</span>
                    <span className={`material-symbols-outlined text-[16px] ${isAr ? "rotate-180" : ""}`}>
                      send
                    </span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
