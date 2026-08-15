import ContactForm from "./ContactForm";
import PageHero from "../PageHero";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'اتصل بنا | كريستال بليندز' : 'Contact Us | Crystal Blinds',
    description: locale === 'ar' ? 'تواصل مع فريق كريستال بليندز للحصول على استشارة ومعاينة مجانية.' : 'Get in touch with Crystal Blinds for a consultation and free measurement.',
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const contactDetails = [
    {
      icon: "location_on",
      title: isAr ? "المقر والمعرض" : "Showroom & Office",
      value: isAr ? "شبرا الخيمة، 74 شارع 15 مايو، أمام مجمع الصوالحة الإسلامي" : "74 15 May St, Shubra El Kheima, in front of El Sawalha Complex",
      subtext: isAr ? "السبت – الخميس: ١٠:٠٠ ص – ٨:٠٠ م" : "Sat – Thu: 10:00 AM – 8:00 PM",
      action: {
        label: isAr ? "عرض في الخريطة" : "View on Map",
        href: "https://maps.google.com/?q=30.1275,31.2437",
        external: true,
      }
    },
    {
      icon: "phone_in_talk",
      title: isAr ? "أرقام التواصل" : "Phone Numbers",
      value: "01100080609",
      secondaryValue: "01020909498",
      subtext: isAr ? "متاحون للرد على استفساراتكم يومياً" : "Available daily for your inquiries",
      action: {
        label: isAr ? "اتصال فوري" : "Call Now",
        href: "tel:01100080609",
        external: false,
      }
    },
    {
      icon: "chat",
      title: isAr ? "واتساب مباشر" : "WhatsApp Chat",
      value: "+20 1100080609",
      subtext: isAr ? "رد سريع خلال دقائق للمعاينة والطلبات" : "Quick response for bookings & inquiries",
      action: {
        label: isAr ? "محادثة فورية" : "Start Chat",
        href: "https://wa.me/201100080609",
        external: true,
      }
    },
    {
      icon: "mail",
      title: isAr ? "البريد الإلكتروني" : "Email Address",
      value: "sales@crystalblinds.com",
      subtext: isAr ? "للمشاريع والمناقصات والتعاون التجاري" : "For corporate projects & partnerships",
      action: {
        label: isAr ? "إرسال إيميل" : "Send Email",
        href: "mailto:sales@crystalblinds.com",
        external: false,
      }
    },
  ];

  return (
    <>
      {/* Hero */}
      <PageHero
        title={isAr ? "اتصل بنا" : "Contact Us"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "اتصل بنا" : "Contact Us" },
        ]}
      />

      {/* Main Section */}
      <section className={`py-16 md:py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723] ${isAr ? 'rtl' : ''}`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Contact Information (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.25em]">
                  {isAr ? "تواصل مباشر" : "GET IN TOUCH"}
                </span>
                <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723]">
                  {isAr ? "نسعد دائماً بخدمتكم وتلبية استفساراتكم" : "We Are Always Here to Assist You"}
                </h2>
                <div className="w-12 h-[2px] bg-[#d4af37]" />
                <p className="text-[#3E2723]/70 text-sm leading-relaxed font-light">
                  {isAr
                    ? "سواء كنت ترغب في حجز موعد معاينة مجانية، الاستفسار عن نوع ستائر معين، أو تنفيذ مشاريع كبرى، فريقنا المتخصص جاهز لمساعدتك."
                    : "Whether you need a free measurement appointment, product information, or commercial project execution, our dedicated team is ready to help."}
                </p>
              </div>

              {/* Info Cards */}
              <div className="space-y-4 pt-4">
                {contactDetails.map((item, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white border border-[#3E2723]/10 rounded-2xl shadow-sm hover:shadow-md hover:border-[#d4af37]/40 transition-all duration-300 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#3E2723]/5 border border-[#3E2723]/10 flex items-center justify-center shrink-0 text-[#d4af37]">
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#3E2723]/60 uppercase tracking-wider">
                          {item.title}
                        </span>
                        {item.action && (
                          <a
                            href={item.action.href}
                            target={item.action.external ? "_blank" : undefined}
                            rel={item.action.external ? "noopener noreferrer" : undefined}
                            className="text-[11px] font-bold text-[#d4af37] hover:text-[#b89358] transition-colors"
                          >
                            {item.action.label} ↗
                          </a>
                        )}
                      </div>

                      <p className="font-bold text-sm md:text-base text-[#3E2723] leading-snug" dir="ltr">
                        {item.value}
                        {item.secondaryValue && (
                          <span className="block text-sm text-[#3E2723]">{item.secondaryValue}</span>
                        )}
                      </p>
                      
                      <p className="text-xs text-[#3E2723]/50 font-light">
                        {item.subtext}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Channels */}
              <div className="pt-2">
                <p className="text-xs font-bold text-[#3E2723]/60 uppercase tracking-wider mb-3">
                  {isAr ? "تابعنا على منصات التواصل" : "Follow Our Social Channels"}
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { name: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100076275195118#' },
                    { name: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/crystalblinds?igsh=aTh0ZDBvbGl2dWtx' },
                    { name: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@crystal_blinds' },
                    { name: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/crystal-for-blinds/posts/?feedView=all&viewAsMember=true' },
                  ].map(s => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-white border border-[#3E2723]/10 flex items-center justify-center hover:bg-[#3E2723] hover:border-[#3E2723] hover:text-white transition-all duration-300 group shadow-sm"
                      title={s.label}
                    >
                      <img
                        src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${s.name}.svg`}
                        className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:invert transition-all"
                        alt={s.label}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Card (7 columns) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#3E2723]/10 rounded-3xl p-8 md:p-12 shadow-[0_15px_40px_rgba(62,39,35,0.04)]">
                <div className="mb-8 space-y-2">
                  <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">
                    {isAr ? "نموذج المراسلة" : "MESSAGE FORM"}
                  </span>
                  <h3 className="font-headline text-2xl font-bold text-[#3E2723]">
                    {isAr ? "أرسل لنا استفسارك أو طلبك" : "Send Us Your Inquiry or Request"}
                  </h3>
                  <p className="text-[#3E2723]/60 text-xs md:text-sm font-light">
                    {isAr
                      ? "املأ البيانات أدناه وسيقوم أحد مهندسينا بالتواصل معك في أقرب وقت."
                      : "Fill out the details below and one of our team will contact you shortly."}
                  </p>
                </div>

                <ContactForm isAr={isAr} />
              </div>
            </div>

          </div>

          {/* Location Map */}
          <div className="mt-20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">
                  {isAr ? "موقع المعرض" : "SHOWROOM LOCATION"}
                </span>
                <h3 className="font-headline text-xl font-bold text-[#3E2723] mt-1">
                  {isAr ? "خريطة الوصول لمعرضنا" : "Find Us on Google Maps"}
                </h3>
              </div>
              <a
                href="https://maps.google.com/?q=30.1275,31.2437"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#3E2723] hover:text-[#d4af37] transition-colors inline-flex items-center gap-1"
              >
                {isAr ? "فتح في خرائط جوجل" : "Open Google Maps"} ↗
              </a>
            </div>

            <div className="rounded-3xl overflow-hidden border border-[#3E2723]/10 shadow-[0_10px_30px_rgba(62,39,35,0.04)] h-80 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.4!2d31.2437!3d30.1275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDA3JzM5LjAiTiAzMcKwMTQnMzcuMiJF!5e0!3m2!1sar!2seg!4v1680000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Crystal Blinds Showroom Location"
              />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
