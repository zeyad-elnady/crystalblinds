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
        className="fixed top-0 w-full z-50 bg-[#faf8f5]/90 backdrop-blur-lg border-b border-[#26170c]/8 transition-shadow duration-300"
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

        <div className="max-w-screen-xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">
          {/* ── Left: Nav Links (desktop) / Hamburger (mobile) ── */}
          <div className={`flex items-center gap-6 ${isAr ? "order-3" : "order-1"}`}>
            {/* Desktop nav */}
            <nav className={`hidden md:flex items-center gap-7 ${isAr ? "flex-row-reverse" : ""}`}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-[13px] font-medium uppercase tracking-[0.12em] text-[#26170c]/75 hover:text-[#26170c] transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-[#d4af37] group-hover:w-full transition-[width] duration-300 ease-out" />
                </a>
              ))}
            </nav>
            {/* Mobile hamburger */}
            <button
              id="nav-menu-btn"
              aria-label="Open menu"
              className="md:hidden text-[#26170c] hover:opacity-60 transition-opacity z-50 relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
            </button>
          </div>

          {/* ── Centre: Brand ── */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none select-none z-50 pointer-events-none">
            <span className="font-headline text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-[#26170c]/60 mb-0.5">
              {isAr ? "مستقبل الستائر" : "The Future of Blinds"}
            </span>
            <a
              href={`/${locale}`}
              className="flex items-center justify-center transition-opacity hover:opacity-80 pointer-events-auto mt-1"
              onClick={() => setMenuOpen(false)}
            >
              <img src="/logo.png" alt="Crystal Blinds" className="h-8 md:h-10 object-contain" />
            </a>
          </div>

          {/* ── Right: Actions ── */}
          <div className={`flex items-center gap-4 ${isAr ? "order-1" : "order-3"}`}>
            {/* Language toggle */}
            <a
              href={isAr ? "/en" : "/ar"}
              id="lang-toggle"
              className="hidden md:flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-widest text-[#26170c]/60 hover:text-[#26170c] transition-colors duration-200 border border-[#26170c]/15 rounded-full px-3 py-1 hover:border-[#26170c]/40"
            >
              <span className="material-symbols-outlined text-[14px]">language</span>
              {isAr ? "EN" : "عر"}
            </a>
            {/* Search */}
            <button
              aria-label="Search"
              className="text-[#26170c] hover:opacity-60 transition-opacity z-50"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            {/* Shopping bag */}
            <a
              href={`/${locale}/cart`}
              id="cart-btn"
              aria-label="View cart"
              className="relative text-[#26170c] hover:opacity-60 transition-opacity z-50 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#26170c] text-[9px] font-bold flex items-center justify-center leading-none">
                0
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#faf8f5] flex flex-col pt-32 px-8 md:hidden transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : isAr ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-10 text-center mt-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-headline text-[#26170c] uppercase tracking-[0.2em] hover:text-[#d4af37] transition-colors"
            >
              {link.label}
            </a>
          ))}

          <hr className="w-16 mx-auto border-[#d4af37]/50 my-6" />

          {/* Language toggle inside mobile menu */}
          <a
            href={isAr ? "/en" : "/ar"}
            className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-[#26170c]/70 hover:text-[#26170c] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            {isAr ? "English" : "العربية"}
          </a>
        </nav>
      </div>
    </>
  );
}
