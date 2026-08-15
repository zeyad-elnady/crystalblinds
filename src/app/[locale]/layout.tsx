import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import SiteHeader from "./SiteHeader";
import SplashScreen from "./SplashScreen";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
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
        { label: "من نحن", href: `/${locale}/about` },
        { label: "الستائر الذكية", href: `/${locale}/smart-curtains` },
        { label: "مشاريعنا", href: `/${locale}/projects` },
        { label: "المنتجات", href: `/${locale}/products` },
        { label: "اتصل بنا",  href: `/${locale}/contact` },
      ]
    : [
        { label: "Home", href: `/${locale}` },
        { label: "About Us", href: `/${locale}/about` },
        { label: "Smart Curtains", href: `/${locale}/smart-curtains` },
        { label: "Projects", href: `/${locale}/projects` },
        { label: "Products", href: `/${locale}/products` },
        { label: "Contact", href: `/${locale}/contact` },
      ];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${ibmPlexSansArabic.variable} h-full antialiased light`}
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
        <CartProvider>
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
          <span className="absolute left-full ml-4 px-3 py-1 bg-[#3E2723] text-white text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded">
            {locale === 'ar' ? 'تواصل معنا' : 'Chat with us'}
          </span>
        </a>

        {/* ── Web Header ── */}
        <SiteHeader locale={locale} isAr={isAr} navLinks={navLinks} />

        <main className="pt-0">
          {children}
        </main>

        {/* Footer */}
        <footer className={`w-full pt-16 md:pt-24 pb-12 px-8 bg-[#3E2723] text-[#FFFDFA] flex flex-col items-center text-center gap-6 ${locale === 'ar' ? 'rtl' : ''} rounded-t-[3rem] md:rounded-t-[0] border-t-[3px] border-[#d4af37] relative mt-10`}>
          {/* Logo */}
          <img src="/logo.png" alt="Crystal Blinds" className="h-16 md:h-24 object-contain" />
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs tracking-widest uppercase mt-4">
            <a className="text-[#FFFDFA]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الخصوصية' : 'Privacy Policy'}</a>
            <a className="text-[#FFFDFA]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الشروط' : 'Terms of Service'}</a>
            <a className="text-[#FFFDFA]/70 hover:text-[#d4af37] transition-colors" href="#">{locale === 'ar' ? 'الضمان والصيانة' : 'Warranty & Care'}</a>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-2">
            <a 
              href="https://www.facebook.com/profile.php?id=100076275195118#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-[#FFFDFA]/20 flex items-center justify-center hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group shadow-sm"
            >
              <svg className="w-4 h-4 fill-white group-hover:fill-[#3E2723] transition-colors" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a 
              href="https://www.instagram.com/crystalblinds?igsh=aTh0ZDBvbGl2dWtx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-[#FFFDFA]/20 flex items-center justify-center hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group shadow-sm"
            >
              <svg className="w-4 h-4 fill-white group-hover:fill-[#3E2723] transition-colors" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a 
              href="https://www.tiktok.com/@crystal_blinds"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 rounded-full border border-[#FFFDFA]/20 flex items-center justify-center hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group shadow-sm"
            >
              <svg className="w-4 h-4 fill-white group-hover:fill-[#3E2723] transition-colors" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>

            <a 
              href="https://www.linkedin.com/company/crystal-for-blinds/posts/?feedView=all&viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-[#FFFDFA]/20 flex items-center justify-center hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group shadow-sm"
            >
              <svg className="w-4 h-4 fill-white group-hover:fill-[#3E2723] transition-colors" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>

          <div className="w-full max-w-5xl h-[1px] bg-[#d4af37]/20 my-4" />

          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-4 text-[#FFFDFA]/40 text-[10px] md:text-xs tracking-widest uppercase mt-2">
            <p>
              {locale === 'ar' ? '© ٢٠٢٤ كريستال للستائر. جميع الحقوق محفوظة.' : '© 2024 Crystal Blinds. All rights reserved.'}
            </p>
            <p className="flex items-center gap-1">
              <span>{locale === 'ar' ? 'تطوير وتصميم' : 'Created by'}</span>
              <a 
                href="https://www.sirad-agancy.com/en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold underline decoration-[#d4af37]/60 hover:decoration-[#d4af37] underline-offset-4 text-[#FFFDFA]/60 hover:text-[#d4af37] transition-all normal-case tracking-normal"
              >
                sirad-agancy.com
              </a>
            </p>
          </div>
        </footer>

        <CartSidebar isAr={isAr} />
        </CartProvider>
      </body>

    </html>
  );
}
