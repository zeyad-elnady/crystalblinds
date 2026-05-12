"use client";

import { useState, useEffect } from "react";

export default function SiteHeader({
  locale,
  isAr,
  navLinks,
}: {
  locale: string;
  isAr: boolean;
  navLinks: { label: string; href: string }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        id="site-header"
        className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[95%] max-w-[1400px] z-50 bg-[#352517]/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-[#d4af37]/20"
      >
        <div className="px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-8">
          {/* ── Left: Nav Links (desktop) / Hamburger (mobile) ── */}
          <div className={`flex items-center gap-6 ${isAr ? "order-3" : "order-1"}`}>
            {/* Desktop nav */}
            <nav className={`hidden md:flex items-center gap-7 ${isAr ? "flex-row-reverse" : ""}`}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-[13px] font-medium uppercase tracking-[0.12em] text-[#faf8f5]/80 hover:text-white transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#d4af37] group-hover:w-full transition-[width] duration-300 ease-out" />
                </a>
              ))}
            </nav>
            {/* Mobile hamburger */}
            <button
              id="nav-menu-btn"
              aria-label="Open menu"
              className="md:hidden text-white hover:text-[#d4af37] transition-colors z-50 relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">{menuOpen ? "close" : "menu"}</span>
            </button>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center leading-none select-none z-50 pointer-events-none">
            <a
              href={`/${locale}`}
              className="flex items-center justify-center transition-opacity hover:opacity-80 pointer-events-auto"
              onClick={() => setMenuOpen(false)}
            >
              <img 
                src="/logo2.png" 
                alt="Crystal Blinds" 
                className="w-[120px] md:w-[160px] h-auto object-contain filter brightness-0 invert opacity-90" 
              />
            </a>
          </div>

          {/* ── Right: Actions ── */}
          <div className={`flex items-center gap-4 ${isAr ? "order-1" : "order-3"}`}>
            {/* Language toggle */}
            <a
              href={isAr ? "/en" : "/ar"}
              id="lang-toggle"
              className="flex items-center gap-1.5 text-[10px] md:text-[12px] font-medium uppercase tracking-widest text-[#faf8f5]/80 hover:text-white transition-colors duration-200 border border-[#faf8f5]/20 rounded-full px-2 py-1 md:px-4 md:py-1.5 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
            >
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">language</span>
              {isAr ? "EN" : "عر"}
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#26170c] flex flex-col pt-32 px-8 md:hidden transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : isAr ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-10 text-center mt-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-headline text-white uppercase tracking-[0.2em] hover:text-[#d4af37] transition-colors"
            >
              {link.label}
            </a>
          ))}

          <hr className="w-16 mx-auto border-[#d4af37]/50 my-6" />

          {/* Language toggle inside mobile menu */}
          <a
            href={isAr ? "/en" : "/ar"}
            className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            {isAr ? "English" : "العربية"}
          </a>
        </nav>
      </div>
    </>
  );
}
