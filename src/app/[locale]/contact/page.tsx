export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'اتصل بنا | كريستال بليندز' : 'Contact Us | Crystal Blinds',
    description: locale === 'ar' ? 'تواصل مع فريق كريستال بليندز للحصول على استشارة مجانية.' : 'Get in touch with Crystal Blinds for a free consultation.',
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#faf8f5] text-[#26170c] pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>
        <div className={`relative z-10 max-w-7xl mx-auto ${isAr ? 'text-right' : ''}`}>
          <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
            {isAr ? 'تواصل معنا' : 'Get in Touch'}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-[#26170c] leading-tight">
            {isAr ? 'دعنا نبدأ' : "Let's Start"} <br />
            <span className="text-[#d4af37] italic font-light">{isAr ? 'محادثة' : 'a Conversation'}</span>
          </h1>
          <p className="text-[#26170c]/60 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
            {isAr
              ? 'سواء كنت تصمم منزلاً جديداً أو تجدد مساحتك، فريقنا هنا لتقديم استشارة مخصصة.'
              : "Whether you're designing a new home or refreshing your current space, our team is here to help."}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className={`py-24 px-6 md:px-12 bg-[#faf8f5] text-[#26170c] relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e9c176]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className={`max-w-7xl mx-auto relative z-10 ${isAr ? 'text-right' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Info */}
            <div className="flex flex-col justify-center gap-10">
              {/* Visit */}
              <div className={`flex gap-6 items-start group ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-[#d4af37] text-[22px]">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">{isAr ? 'زيارة معرضنا' : 'Visit Our Showroom'}</p>
                  <p className="text-[#26170c] font-medium text-sm md:text-base">
                    {isAr ? 'شبرآ الخيمة، 74 شارع 15 مايو، أمام مجمع الصوالحة الإسلامي' : '74 15 May Street, Shubra El Kheima, in front of El Sawalha Islamic Complex'}
                  </p>
                  <p className="text-[#26170c]/50 text-xs mt-1">{isAr ? 'السبت – الخميس، ١٠ص – ٨م' : 'Sat – Thu, 10 AM – 8 PM'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className={`flex gap-6 items-start group ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-[#d4af37] text-[22px]">call</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">{isAr ? 'اتصل بنا' : 'Call Us'}</p>
                  <a href="tel:01100080609" className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#d4af37] transition-colors block" dir="ltr">01100080609</a>
                  <a href="tel:01020909498" className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#d4af37] transition-colors block" dir="ltr">01020909498</a>
                  <p className="text-[#26170c]/50 text-xs mt-1">{isAr ? 'نرد على مكالماتك خلال ٢٤ ساعة' : 'We respond within 24 hours'}</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className={`flex gap-6 items-start group ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#25D366] group-hover:bg-[#25D366]/10 transition-all duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WhatsApp" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">WhatsApp</p>
                  <a href="https://wa.me/201100080609" target="_blank" rel="noopener noreferrer"
                    className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#25D366] transition-colors" dir="ltr">
                    +20 1100080609
                  </a>
                  <p className="text-[#26170c]/50 text-xs mt-1">{isAr ? 'تحدث معنا مباشرة' : 'Chat with us directly'}</p>
                </div>
              </div>

              {/* Email */}
              <div className={`flex gap-6 items-start group ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 shrink-0 rounded-full border border-[#26170c]/10 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-[#d4af37] text-[22px]">mail</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-1">{isAr ? 'راسلنا' : 'Email Us'}</p>
                  <a href="mailto:sales@crystalblinds.com" className="text-[#26170c] font-medium text-sm md:text-base hover:text-[#d4af37] transition-colors">sales@crystalblinds.com</a>
                  <p className="text-[#26170c]/50 text-xs mt-1">{isAr ? 'للمشاريع الخاصة والتعاون' : 'For bespoke projects & partnerships'}</p>
                </div>
              </div>

              {/* Social */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest text-[#26170c]/50 mb-3 ${isAr ? 'text-right' : ''}`}>{isAr ? 'تابعنا' : 'Follow Us'}</p>
                <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {[
                    { name: 'facebook',  href: 'https://facebook.com/crystalblinds.eg' },
                    { name: 'instagram', href: 'https://instagram.com/crystalblinds.eg' },
                    { name: 'tiktok',    href: 'https://tiktok.com/@crystalblinds.eg' },
                  ].map(s => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-[#26170c]/15 flex items-center justify-center hover:bg-[#C6AB8E] hover:border-[#26170c] transition-all duration-300 group">
                      <img src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${s.name}.svg`}
                        className="w-4 h-4 group-hover:invert transition-all" alt={s.name} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="relative">
              <div className="bg-white/60 border border-white/40 rounded-2xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_40px_rgba(38,23,12,0.05)]">
                <h2 className="font-headline text-2xl text-[#26170c] mb-8">{isAr ? 'أرسل رسالة' : 'Send a Message'}</h2>
                <form className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cname" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input type="text" id="cname" placeholder={isAr ? 'أدخل اسمك' : 'Your name'}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cphone" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input type="tel" id="cphone" dir="ltr" placeholder="+20 1X XXXX XXXX"
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cemail" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input type="email" id="cemail" dir="ltr" placeholder="email@example.com"
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cmsg" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      {isAr ? 'رسالتك' : 'Your Message'}
                    </label>
                    <textarea id="cmsg" rows={4} placeholder={isAr ? 'أخبرنا عن مشروعك...' : 'Tell us about your space and vision...'}
                      className="bg-transparent border-b border-[#26170c]/10 pb-3 text-[#26170c] placeholder:text-[#26170c]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm resize-none" />
                  </div>
                  <a href="https://wa.me/201100080609"
                    target="_blank" rel="noopener noreferrer"
                    className={`mt-4 flex items-center justify-center gap-3 bg-[#C6AB8E] text-[#26170c] py-4 rounded font-bold tracking-widest uppercase text-xs hover:bg-[#3d2b1f] transition-colors shadow-lg`}>
                    <span>{isAr ? 'أرسل عبر واتساب' : 'Send via WhatsApp'}</span>
                    <span className={`material-symbols-outlined text-[16px] ${isAr ? 'rotate-180' : ''}`}>send</span>
                  </a>
                </form>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-16 rounded-2xl overflow-hidden border border-white/40 shadow-[0_10px_30px_rgba(38,23,12,0.06)] h-72 md:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.4!2d31.2437!3d30.1275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDA3JzM5LjAiTiAzMcKwMTQnMzcuMiJF!5e0!3m2!1sar!2seg!4v1680000000000"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Crystal Blinds Location"
            />
          </div>
        </div>
      </section>
    </>
  );
}
