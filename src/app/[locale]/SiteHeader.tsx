"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

type NavLink = { label: string; href: string };

export default function SiteHeader({
  locale,
  isAr,
  navLinks,
}: {
  locale: string;
  isAr: boolean;
  navLinks: NavLink[];
}) {
  const pathname = usePathname();
  const { items, toggleCart } = useCart();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getTogglePath = () => {
    const targetLocale = isAr ? "en" : "ar";
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (segments[0] === "ar" || segments[0] === "en")) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }
    return `/${segments.join("/")}`;
  };

  const openDrop = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const startClose = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const cancelClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Mega dropdown content definitions
  const productsMenu = {
    key: "products",
    columns: [
      {
        title: isAr ? "ستائر رول" : "Roller Blinds",
        img: "/photos for crystal/ستائر رول صن سكرين.jpeg",
        items: [
          { label: isAr ? "صن سكرين" : "Sunscreen", href: `/${locale}/products?category=sunscreen` },
          { label: isAr ? "بلاك أوت" : "Blackout", href: `/${locale}/products?category=blackout` },
          { label: isAr ? "سان لايت (مطبوعة)" : "Sunlight (Printed)", href: `/${locale}/products?category=sunlight` },
        ],
        cta: { label: isAr ? "مشاهدة التشكيلة" : "View Collection", href: `/${locale}/products` },
      },
      {
        title: isAr ? "ستائر زيبرا" : "Zebra Blinds",
        img: "/photos for crystal/ستائر زيبرا.jpeg",
        items: [
          { label: isAr ? "زيبرا مودرن" : "Zebra Modern", href: `/${locale}/products?category=zebra` },
          { label: isAr ? "زيبرا بلاك أوت" : "Zebra Blackout", href: `/${locale}/products?category=zebra` },
        ],
        cta: { label: isAr ? "مشاهدة التشكيلة" : "View Collection", href: `/${locale}/products?category=zebra` },
      },
      {
        title: isAr ? "ستائر شرائح خشبية" : "Wooden Blinds",
        img: "/photos for crystal/ستائر شرائح خشبيه.jpeg",
        items: [
          { label: isAr ? "رومان" : "Roman", href: `/${locale}/products?category=roman` },
          { label: isAr ? "دريم" : "Dream", href: `/${locale}/products?category=dream` },
          { label: isAr ? "بامبو" : "Bamboo", href: `/${locale}/products?category=bamboo` },
        ],
        cta: { label: isAr ? "مشاهدة التشكيلة" : "View Collection", href: `/${locale}/products?category=bamboo` },
      },
      {
        title: isAr ? "ستائر مطبوعة" : "Printed Blinds",
        img: "/photos for crystal/printed_roller.png",
        items: [
          { label: isAr ? "تصاميم فنية" : "Artistic Designs", href: `/${locale}/products` },
          { label: isAr ? "مطبوع حسب الطلب" : "Custom Print", href: `/${locale}/contact` },
        ],
        cta: { label: isAr ? "طلب تصميم خاص" : "Custom Order", href: `/${locale}/contact` },
      },
    ],
    sidePanel: {
      title: isAr ? "خدمة المعاينة" : "Measurement Service",
      items: [
        { label: isAr ? "معاينة مجانية" : "Free Consultation", icon: "ruler_alt" },
        { label: isAr ? "تركيب احترافي" : "Pro Installation", icon: "construction" },
      ],
      cta: { label: isAr ? "احجز الآن" : "Book Now", href: `/${locale}/#reserve` },
    },
  };

  const smartMenu = {
    key: "smart",
    columns: [
      {
        title: "Somfy",
        img: "/photos for crystal/hero1.jpeg",
        items: [
          { label: isAr ? "موتورات Somfy" : "Somfy Motors", href: `/${locale}/smart-curtains/somfy` },
          { label: isAr ? "تحكم صوتي" : "Voice Control", href: `/${locale}/smart-curtains/somfy` },
          { label: isAr ? "تطبيق الهاتف" : "Mobile App", href: `/${locale}/smart-curtains/somfy` },
        ],
        cta: { label: isAr ? "استكشف Somfy" : "Explore Somfy", href: `/${locale}/smart-curtains/somfy` },
      },
      {
        title: "Azura",
        img: "/photos for crystal/hero2.jpeg",
        items: [
          { label: isAr ? "موتورات Azura" : "Azura Motors", href: `/${locale}/smart-curtains/azura` },
          { label: isAr ? "أتمتة لاسلكية" : "Wireless Auto", href: `/${locale}/smart-curtains/azura` },
          { label: isAr ? "شحن بالطاقة الشمسية" : "Solar Charging", href: `/${locale}/smart-curtains/azura` },
        ],
        cta: { label: isAr ? "استكشف Azura" : "Explore Azura", href: `/${locale}/smart-curtains/azura` },
      },
    ],
    sidePanel: {
      title: isAr ? "لماذا الستائر الذكية؟" : "Why Smart Curtains?",
      items: [
        { label: isAr ? "توفير الطاقة" : "Energy Saving", icon: "eco" },
        { label: isAr ? "تحكم أوتوماتيكي" : "Full Automation", icon: "auto_mode" },
        { label: isAr ? "تصميم فاخر" : "Luxury Design", icon: "diamond" },
      ],
      cta: { label: isAr ? "احجز استشارة" : "Book Consultation", href: `/${locale}/contact` },
    },
  };

  const projectsMenu = {
    key: "projects",
    columns: [
      {
        title: isAr ? "مشاريع سكنية" : "Residential",
        img: "/photos for crystal/1.jpeg",
        items: [
          { label: isAr ? "فيلل وقصور" : "Villas & Palaces", href: `/${locale}/projects` },
          { label: isAr ? "شقق وفاخرة" : "Apartments", href: `/${locale}/projects` },
        ],
        cta: { label: isAr ? "مشاهدة المشاريع" : "View Projects", href: `/${locale}/projects` },
      },
      {
        title: isAr ? "مشاريع تجارية" : "Commercial",
        img: "/photos for crystal/hospital_curtain.png",
        items: [
          { label: isAr ? "مكاتب وشركات" : "Offices & Firms", href: `/${locale}/projects` },
          { label: isAr ? "فنادق ومنتجعات" : "Hotels & Resorts", href: `/${locale}/projects` },
          { label: isAr ? "مستشفيات" : "Medical Centers", href: `/${locale}/projects` },
        ],
        cta: { label: isAr ? "تواصل معنا" : "Get a Quote", href: `/${locale}/contact` },
      },
    ],
    sidePanel: {
      title: isAr ? "أكثر من 1000 مشروع" : "Over 1000 Projects",
      items: [
        { label: isAr ? "تنفيذ عالي الجودة" : "High Quality Executions", icon: "verified" },
        { label: isAr ? "التزام بالموعد" : "On-Time Delivery", icon: "schedule" },
      ],
      cta: { label: isAr ? "تواصل مع مهندسنا" : "Contact Engineers", href: `/${locale}/contact` },
    },
  };

  const getMenuData = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("product") || l.includes("منتج")) return productsMenu;
    if (l.includes("smart") || l.includes("ذكية")) return smartMenu;
    if (l.includes("project") || l.includes("مشاري")) return projectsMenu;
    return null;
  };

  return (
    <>
      <header
        id="site-header"
        className="fixed top-4 inset-x-3 sm:inset-x-6 max-w-[1400px] mx-auto z-50 bg-[#3E2723]/96 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/10"
      >
        <div className="px-4 md:px-6 h-16 md:h-[68px] flex items-center justify-between gap-4" dir={isAr ? "rtl" : "ltr"}>

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <a href={`/${locale}`} className="flex items-center hover:opacity-85 transition-opacity" onClick={() => setMenuOpen(false)}>
              <img
                src="/logo2.png"
                alt="Crystal Blinds"
                className="w-[110px] sm:w-[130px] md:w-[145px] h-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </a>
          </div>

          {/* Nav Links (desktop center) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 mx-2">
            {navLinks.map((link) => {
              const menuData = getMenuData(link.label);
              const isOpen = activeDropdown === link.label;
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => openDrop(link.label)}
                  onMouseLeave={startClose}
                >
                  <a
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 text-[12.5px] xl:text-[13.5px] font-bold text-[#FFFDFA]/85 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 whitespace-nowrap ${isAr ? "tracking-normal" : "tracking-wide uppercase"}`}
                  >
                    {link.label}
                    {menuData && (
                      <span className={`material-symbols-outlined text-[13px] text-white/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    )}
                  </a>

                  {/* Mega dropdown */}
                  {menuData && isOpen && (
                    <div
                      className="fixed left-1/2 -translate-x-1/2 z-[200]"
                      style={{ top: "calc(1rem + 68px)", width: "min(1180px, 96vw)" }}
                      onMouseEnter={cancelClose}
                      onMouseLeave={startClose}
                    >
                      {/* Invisible bridge */}
                      <div className="absolute -top-6 inset-x-0 h-6" onMouseEnter={cancelClose} />
                      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(62,39,35,0.15)] border border-[#3E2723]/10 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>

                        {/* Columns row */}
                        <div className={`flex ${isAr ? "flex-row-reverse" : ""}`}>
                          {/* Product columns */}
                          <div
                            className="flex-1 grid divide-x divide-[#3E2723]/6"
                            style={{ gridTemplateColumns: `repeat(${menuData.columns.length}, 1fr)` }}
                          >
                            {menuData.columns.map((col, ci) => (
                              <div key={ci} className={`flex flex-col p-5 gap-3 ${isAr && ci < menuData.columns.length - 1 ? "border-r border-[#3E2723]/6" : ""}`}>
                                {/* Photo */}
                                <a href={col.cta.href} className="relative w-full rounded-lg overflow-hidden bg-[#f5f0eb] block group" style={{ height: 120 }}>
                                  <img
                                    src={col.img}
                                    alt={col.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                  <span className="absolute bottom-2.5 left-3 right-3 text-white font-bold text-[11px] tracking-wide leading-tight">
                                    {col.title}
                                  </span>
                                </a>

                                {/* Sub-links */}
                                <div className="flex flex-col gap-0.5">
                                  {col.items.map((item, ii) => (
                                    <a
                                      key={ii}
                                      href={item.href}
                                      className="text-[12px] text-[#3E2723]/60 hover:text-[#3E2723] py-1.5 transition-colors border-b border-[#3E2723]/5 last:border-0 font-medium"
                                    >
                                      {item.label}
                                    </a>
                                  ))}
                                </div>

                                {/* Column link */}
                                <a
                                  href={col.cta.href}
                                  className="mt-auto text-[11px] font-bold text-[#3E2723] hover:text-[#b8922a] transition-colors flex items-center gap-1 group"
                                >
                                  {col.cta.label}
                                  <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">{isAr ? "chevron_left" : "chevron_right"}</span>
                                </a>
                              </div>
                            ))}
                          </div>

                          {/* Side panel */}
                          <div className={`w-[200px] shrink-0 bg-[#FAF7F3] flex flex-col ${isAr ? "border-r border-[#3E2723]/8" : "border-l border-[#3E2723]/8"}`}>
                            {/* Dark header */}
                            <div className="bg-[#3E2723] text-white px-5 py-4">
                              <p className="font-bold text-[12px] tracking-wide">{menuData.sidePanel.title}</p>
                            </div>

                            {/* Items */}
                            <div className="flex flex-col flex-1 divide-y divide-[#3E2723]/6">
                              {menuData.sidePanel.items.map((item, i) => (
                                <p key={i} className="px-5 py-3.5 text-[12px] text-[#3E2723]/70 font-medium">{item.label}</p>
                              ))}
                            </div>

                            {/* Book CTA */}
                            <div className="p-4">
                              <a
                                href={menuData.sidePanel.cta.href}
                                className="flex items-center justify-center gap-1.5 w-full bg-[#3E2723] text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5 rounded-lg hover:bg-[#2C1D18] border border-[#C5A059]/40 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                {menuData.sidePanel.cta.label}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* See all row */}
                        <div className="border-t border-[#3E2723]/6 px-6 py-3 flex items-center justify-between bg-[#FAF7F3]/60" dir={isAr ? "rtl" : "ltr"}>
                          <span className="text-[11px] text-[#3E2723]/40">
                            {isAr ? "تصفح مجموعتنا الكاملة من المنتجات" : "Browse our full collection of premium window treatments"}
                          </span>
                          <a
                            href={`/${locale}/products`}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-[#3E2723] hover:text-[#b8922a] transition-colors group"
                          >
                            {isAr ? "عرض كل المنتجات" : "See All Products"}
                            <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">{isAr ? "chevron_left" : "chevron_right"}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions (right) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={getTogglePath()}
              id="lang-toggle"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFFDFA]/85 hover:text-white border border-[#FFFDFA]/20 rounded-xl px-3 py-1.5 hover:border-white/30 hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">language</span>
              {isAr ? "EN" : "عربي"}
            </a>

            <button
              id="cart-toggle-btn"
              onClick={() => toggleCart(true)}
              className="relative flex items-center justify-center text-[#FFFDFA]/90 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 cursor-pointer"
              aria-label="Open Cart"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#C5A059] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              id="nav-menu-btn"
              aria-label="Open menu"
              className="lg:hidden text-white hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">{menuOpen ? "close" : "menu"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#2B1B17] flex flex-col md:hidden transition-transform duration-500 ease-in-out overflow-y-auto ${
          menuOpen ? "translate-x-0" : isAr ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <div className="pt-28 px-6 pb-12">
          <nav className="flex flex-col gap-1" dir={isAr ? "rtl" : "ltr"}>
            {navLinks.map((link) => {
              const menuData = getMenuData(link.label);
              return (
                <div key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl text-xl font-bold text-white hover:text-white hover:bg-white/5 transition-colors ${isAr ? "flex-row-reverse" : "uppercase tracking-wider"}`}
                  >
                    {link.label}
                    {menuData && <span className="material-symbols-outlined text-white/30 text-lg">chevron_right</span>}
                  </a>
                  {menuData && (
                    <div className={`ml-4 pl-4 border-l-2 border-white/10 flex flex-col gap-1 mb-2 ${isAr ? "mr-4 pr-4 border-r-2 border-l-0 ml-0 pl-0" : ""}`}>
                      {menuData.columns.flatMap(c => c.items).map((item, i) => (
                        <a
                          key={i}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="px-3 py-2 text-sm text-white/55 hover:text-white transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <hr className="border-white/10 my-6" />
          <a
            href={getTogglePath()}
            className="flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white transition-colors uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-base">language</span>
            {isAr ? "English" : "العربية"}
          </a>
        </div>
      </div>

      {/* Backdrop */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40 bg-[#3E2723]/10 backdrop-blur-[1px] hidden md:block pointer-events-none" />
      )}
    </>
  );
}
