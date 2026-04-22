import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans, Amiri, Cairo } from "next/font/google";
import "../globals.css";
import SiteHeader from "./SiteHeader";

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

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Crystal Blinds | Luxury Window Treatments",
  description: "Curated collections of premium curtains, blinds, and window treatments crafted for the discerning home.",
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
        { label: "الرئيسية", href: "#home" },
        { label: "المنتجات", href: "#products" },
        { label: "عن الشركة", href: "#about" },
        { label: "اتصل بنا",  href: "#contact" },
      ]
    : [
        { label: "Home", href: "#home" },
        { label: "Products", href: "#products" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${notoSerif.variable} ${plusJakartaSans.variable} ${amiri.variable} ${cairo.variable} h-full antialiased light`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Strip attributes injected by browser extensions (e.g. Bitdefender's bis_skin_checked)
            before React hydrates — prevents hydration mismatch warnings in dev */}
        <script
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

        {/* ── Web Header ── */}
        <SiteHeader locale={locale} isAr={isAr} navLinks={navLinks} />

        <main className="pt-[66px]">
          {children}
        </main>

        {/* Footer */}
        <footer className={`w-full pt-16 pb-24 px-8 bg-[#26170c] text-[#f5f5dc] flex flex-col items-center text-center gap-8 ${locale === 'ar' ? 'rtl' : ''}`}>
          <h2 className="text-xl font-headline font-serif text-[#d4af37] tracking-widest uppercase">Silk & Stone</h2>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <a className="text-[#f5f5dc]/80 hover:text-white transition-colors" href="#">{locale === 'ar' ? 'الخصوصية' : 'Privacy Policy'}</a>
            <a className="text-[#f5f5dc]/80 hover:text-white transition-colors" href="#">{locale === 'ar' ? 'الشروط' : 'Terms of Service'}</a>
            <a className="text-[#f5f5dc]/80 hover:text-white transition-colors" href="#">{locale === 'ar' ? 'العناية بالمنسوجات' : 'Fabric Care'}</a>
          </div>
          <p className="text-[#f5f5dc]/60 text-sm">{locale === 'ar' ? '© ٢٠٢٤ سيلك آند ستون. جميع الحقوق محفوظة.' : '© 2024 Silk & Stone. All rights reserved.'}</p>
        </footer>

      </body>
    </html>
  );
}
