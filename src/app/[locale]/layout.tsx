import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans, Alexandria, Tajawal } from "next/font/google";
import "../globals.css";
import SiteHeader from "./SiteHeader";
import SplashScreen from "./SplashScreen";
import Script from "next/script";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plus-jakarta",
});

const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-alexandria",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crystalblinds-eg.com"),
  title: {
    default: "Crystal Blinds Egypt - Curtains | كريستال بليندز مصر - ستائر",
    template: "%s | Crystal Blinds",
  },
  description: "Crystal Blinds Egypt offers premium curtains, blinds, and window treatments. كريستال بليندز مصر الخيار الأول لأحدث ستائر المكاتب، ستائر رول، والستائر المطبوعة.",
  keywords: [
    "crystal blinds egypt",
    "crystal blinds egypt curtains",
    "crystal blinds egypt - certain",
    "كريستال بليندز مصر",
    "كريستال بليندز مصر - ستائر",
    "ستائر",
    "curtains",
    "blinds",
    "ستائر مكتبية",
    "ستائر رول",
    "egypt blinds",
    "office blinds egypt",
    "premium window treatments"
  ],
  authors: [{ name: "Crystal Blinds" }],
  creator: "Crystal Blinds",
  publisher: "Crystal Blinds",
  verification: {
    google: "HR7XKoJZTw65xihfyBvazGA1v4xniqq_8EY754eaq34",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-EG': '/ar',
    },
  },
  openGraph: {
    title: "Crystal Blinds Egypt - Premium Curtains & Window Treatments",
    description: "Discover luxury window treatments with Crystal Blinds Egypt. كريستال بليندز مصر لتصميم وتنفيذ أحدث الستائر.",
    url: "https://crystalblinds-eg.com",
    siteName: "Crystal Blinds Egypt",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "Crystal Blinds Egypt Logo",
      },
    ],
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crystal Blinds Egypt - Curtains & Blinds",
    description: "Premium office blinds and luxury window treatments in Egypt.",
    images: ["/logo2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [
    { rel: "icon", url: "/favicon.ico?v=2", sizes: "any" },
    { rel: "apple-touch-icon", url: "/logo2.png?v=2" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const navLinks = isAr
    ? [
        { label: "الرئيسية", href: `/${locale}` },
        { label: "المنتجات", href: `/${locale}/products` },
        { label: "اتصل بنا",  href: `/${locale}/contact` },
      ]
    : [
        { label: "Home", href: `/${locale}` },
        { label: "Products", href: `/${locale}/products` },
        { label: "Contact", href: `/${locale}/contact` },
      ];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${notoSerif.variable} ${plusJakartaSans.variable} ${alexandria.variable} ${tajawal.variable} h-full antialiased light`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Strip attributes injected by browser extensions (e.g. Bitdefender's bis_skin_checked)
            before React hydrates — prevents hydration mismatch warnings in dev */}
        <Script
          id="hydration-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var ATTRS = ['bis_skin_checked','bis_register'];
  var stripAttrs = function(el){
    ATTRS.forEach(function(a){ if(el.hasAttribute && el.hasAttribute(a)) el.removeAttribute(a); });
  };
  var walk = function(node){
    if(node.nodeType!==1) return;
    stripAttrs(node);
    for(var i=0;i<node.childNodes.length;i++) walk(node.childNodes[i]);
  };
  walk(document.documentElement);
  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.type==='attributes' && ATTRS.indexOf(m.attributeName)!==-1){
        m.target.removeAttribute(m.attributeName);
      }
      m.addedNodes.forEach(function(n){ walk(n); });
    });
  });
  mo.observe(document.documentElement,{attributes:true,childList:true,subtree:true,attributeFilter:ATTRS});
})();`,
          }}
        />
      </head>
      <body className="bg-background text-on-background font-body min-h-full" suppressHydrationWarning>
        {/* Premium Splash Screen */}
        <SplashScreen />

        {/* Floating WhatsApp */}
        <a 
          href="https://wa.me/201100080609" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-[45] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300 group"
          aria-label="Contact on WhatsApp"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-8 h-8" alt="WhatsApp" />
          <span className="absolute left-full ml-4 px-3 py-1 bg-[#26170c] text-white text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded">
            {locale === 'ar' ? 'تواصل معنا' : 'Chat with us'}
          </span>
        </a>

        {/* ── Web Header ── */}
        <SiteHeader locale={locale} isAr={isAr} navLinks={navLinks} />

        <main className="pt-0">
          {children}
        </main>

        {/* Footer */}
        <footer className={`w-full pt-16 md:pt-24 pb-12 px-8 bg-[#26170c] text-[#faf8f5] flex flex-col items-center text-center gap-6 ${locale === 'ar' ? 'rtl' : ''} rounded-t-[3rem] md:rounded-t-[0] border-t-[3px] border-[#d4af37] relative mt-10`}>
          {/* Logo */}
          <img src="/logo.png" alt="Crystal Blinds" className="h-16 md:h-24 object-contain" />
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs tracking-widest uppercase mt-4">
            <a className="text-[#faf8f5]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الخصوصية' : 'Privacy Policy'}</a>
            <a className="text-[#faf8f5]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الشروط' : 'Terms of Service'}</a>
            <a className="text-[#faf8f5]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الضمان والصيانة' : 'Warranty & Care'}</a>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-2">
            {[
              { icon: 'facebook', href: 'https://facebook.com/crystalblinds.eg' },
              { icon: 'instagram', href: 'https://instagram.com/crystalblinds.eg' },
              { icon: 'tiktok', href: 'https://tiktok.com/@crystalblinds.eg' }
            ].map((social) => (
              <a 
                key={social.icon}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[#faf8f5]/10 flex items-center justify-center hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group"
              >
                <img 
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${social.icon}.svg`} 
                  className="w-4 h-4 invert group-hover:filter-none transition-all" 
                  alt={social.icon} 
                />
              </a>
            ))}
          </div>

          <div className="w-16 md:w-24 h-[1px] bg-[#d4af37]/30 my-2 md:my-4" />

          <p className="text-[#faf8f5]/40 text-[10px] md:text-xs tracking-widest uppercase">
            {locale === 'ar' ? '© ٢٠٢٤ كريستال للستائر. جميع الحقوق محفوظة.' : '© 2024 Crystal Blinds. All rights reserved.'}
          </p>
        </footer>

      </body>

    </html>
  );
}
