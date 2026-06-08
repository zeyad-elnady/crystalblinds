"use client";

import { useState } from "react";

import Link from "next/link";
import { type Product } from "@/lib/products";

const CATEGORIES = [
  { id: "All", labelEn: "All", labelAr: "الكل" },
  { id: "Smart", labelEn: "Smart Blinds", labelAr: "ستائر ذكية" },
  { id: "Roller", labelEn: "Roller", labelAr: "رول" },
  { id: "Printed", labelEn: "Printed", labelAr: "مطبوعه" },
  { id: "Modern", labelEn: "Modern", labelAr: "عصري" },
  { id: "Classic", labelEn: "Classic", labelAr: "كلاسيك" },
  { id: "Medical", labelEn: "Dividers", labelAr: "بين اسره" },
];

function ProductCardItem({
  product,
  isAr
}: {
  product: Product;
  isAr: boolean;
}) {
  return (
    <div className="group flex flex-col bg-[#FFFDFA]/60 border border-white/50 rounded-xl overflow-hidden hover:bg-[#FFFDFA]/80 transition-all duration-500 hover:shadow-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] backdrop-blur-md">
      {/* Image Swap */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0 group/image">
        {/* Main image */}
        <img
          src={product.images[0]}
          alt={product.alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${product.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
        />

        {/* Hover image */}
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.alt} hover`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-6 ${isAr ? "items-end" : "items-start"}`}>
        <div className={`w-full flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-semibold">
            {isAr ? "الأقمشة الفاخرة" : "Artisan Fabrics"}
          </span>
          {/* Price */}
          <span className="text-[#3E2723] font-bold text-sm bg-[#FFFDFA]/50 px-2.5 py-1 rounded shadow-sm border border-white/60">
            {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
          </span>
        </div>

        <h4 className="font-headline text-xl text-[#3E2723] font-bold mb-3">
          {isAr ? product.labelAr : product.labelEn}
        </h4>
        <p className="text-[#3E2723]/70 text-sm leading-relaxed mb-4 flex-1">
          {isAr ? product.descAr : product.descEn}
        </p>

        <Link
          href={`/${isAr ? 'ar' : 'en'}/products/${product.id}`}
          className={`flex items-center gap-2 text-white bg-[#3E2723] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#d4af37] transition-colors mt-auto w-fit shadow-md ${isAr ? "mr-auto flex-row-reverse" : "ml-auto"}`}
        >
          <span>
            {isAr ? "عرض التفاصيل" : "View Details"}
          </span>
          <span className={`material-symbols-outlined text-sm ${isAr ? "rotate-180" : ""}`}>
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ProductCards({ isAr, products, isBrief = false }: { isAr: boolean, products: Product[], isBrief?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProducts = isBrief
    ? products.slice(0, 4)
    : activeCategory === "All"
    ? products
    : activeCategory === "Smart"
    ? products.filter(p => !["Medical"].includes(p.category)) // Example logic for Smart
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="w-full flex flex-col items-center px-6 md:px-12 pb-16 pt-8">
      {/* Filter Tabs */}
      {!isBrief && (
        <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12 ${isAr ? "flex-row-reverse" : ""}`}>
          {CATEGORIES.map((cat) => {
            const isSmart = cat.id === "Smart";
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`
                  px-6 py-2.5 rounded-full text-sm tracking-wider font-semibold transition-all duration-300 border flex items-center gap-1.5
                  ${isActive
                    ? (isSmart 
                        ? "bg-[#d4af37] border-[#d4af37] text-white shadow-[0_0_20px_rgba(212,175,55,0.6)]" 
                        : "bg-[#3E2723] border-[#3E2723] text-[#FFFDFA]")
                    : (isSmart 
                        ? "bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/20 shadow-[0_0_10px_rgba(212,175,55,0.3)] md:animate-pulse" 
                        : "bg-[#FFFDFA]/50 border-[#3E2723]/20 text-[#3E2723]/70 hover:border-[#d4af37] hover:text-[#d4af37]")
                  }
                `}
              >
                {isSmart && <span className="material-symbols-outlined text-[16px]">bolt</span>}
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Smart Living Info Box */}
      {!isBrief && activeCategory === "Smart" && (
        <div className={`w-full max-w-7xl mb-16 relative group ${isAr ? "rtl text-right" : "ltr text-left"}`}>
          {/* Animated Glow Behind */}
          <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-[#d4af37]/40 via-[#3E2723] to-[#d4af37]/40 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-[#3E2723] bg-gradient-to-br from-[#3E2723] via-[#3E2723] to-[#110a05] text-white rounded-[2rem] p-5 sm:p-8 md:p-14 overflow-hidden border border-[#d4af37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Dynamic Background Effects */}
<div className="relative z-10 flex flex-col items-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)] md:animate-pulse">
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">bolt</span>
                <span className="font-bold tracking-widest uppercase text-[10px] md:text-xs text-center">
                  {isAr ? "تكنولوجيا المنازل الذكية" : "Smart Home Technology"}
                </span>
              </div>
              <p className="mt-4 md:mt-6 text-white/60 text-xs sm:text-sm md:text-base max-w-2xl text-center leading-relaxed">
                {isAr 
                  ? "قم بترقية نمط حياتك مع أنظمة التحكم الذكية للستائر. اختر من بين أفضل المحركات العالمية وأنظمة التشغيل التي تناسب تأسيس منزلك لتجربة مريحة وفخمة."
                  : "Upgrade your lifestyle with our smart blind control systems. Choose from world-class motors and operating systems tailored to your home's setup for a truly luxurious and convenient experience."}
              </p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              
              {/* Brands Column */}
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4 mb-1 md:mb-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8922a] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0">
                    <span className="material-symbols-outlined text-white text-[20px] md:text-[24px]">verified</span>
                  </div>
                  <h3 className="font-headline text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    {isAr ? 'الماركات والضمان' : 'Brands & Warranty'}
                  </h3>
                </div>
                
                <div className="group/card bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-5 md:p-6 hover:bg-white/[0.06] hover:border-[#d4af37]/50 transition-all duration-300 relative overflow-hidden">

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h4 className="font-bold text-lg md:text-xl text-white">{isAr ? 'ماركة سومفي (Somfy)' : 'Somfy Motors'}</h4>
                      <span className="text-[9px] md:text-[10px] font-bold tracking-wider text-[#3E2723] bg-[#d4af37] px-3 py-1 rounded-full uppercase shadow-[0_0_10px_rgba(212,175,55,0.3)] w-fit whitespace-nowrap">
                        {isAr ? '10 سنوات ضمان' : '10-Year Warranty'}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                      {isAr ? 'الاختيار الأول للأداء الشاق، جودة فرنسية عالمية لتجربة استثنائية وعمر افتراضي طويل.' : 'The premium choice for heavy duty performance, world-class French quality for an exceptional experience.'}
                    </p>
                  </div>
                </div>

                <div className="group/card bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-5 md:p-6 hover:bg-white/[0.06] hover:border-white/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover/card:bg-white/10 transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h4 className="font-bold text-lg md:text-xl text-white">{isAr ? 'ماركة أزارو (Azzaro)' : 'Azzaro Motors'}</h4>
                      <span className="text-[9px] md:text-[10px] font-bold tracking-wider text-white bg-white/10 border border-white/20 px-3 py-1 rounded-full uppercase w-fit whitespace-nowrap">
                        {isAr ? '5 سنوات ضمان' : '5-Year Warranty'}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                      {isAr ? 'جودة ممتازة وسعر منافس، عملية وتدوم طويلاً لأداء يومي سلس وموثوق.' : 'Excellent quality at a competitive price, reliable and long-lasting for smooth daily operation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Systems Column */}
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4 mb-1 md:mb-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                    <span className="material-symbols-outlined text-[#d4af37] text-[20px] md:text-[24px]">settings_remote</span>
                  </div>
                  <h3 className="font-headline text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    {isAr ? 'أنظمة التشغيل' : 'Operating Systems'}
                  </h3>
                </div>
                
                <div className="group/card bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#d4af37]/60 transition-all duration-300 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-[#d4af37]">smartphone</span>
                      <h4 className="font-bold text-lg md:text-xl text-white">{isAr ? 'تطبيق الموبايل' : 'Smart App'}</h4>
                    </div>
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                      {isAr ? 'تحكم كامل من أي مكان عبر هاتفك الذكي وتكامل مع أنظمة المنزل الذكي.' : 'Complete control from anywhere via your smartphone, integrated with your smart home.'}
                    </p>
                    <div className="mt-4 flex items-start sm:items-center gap-2 bg-[#3E2723]/50 p-3 rounded-lg border border-white/5">
                      <span className="material-symbols-outlined text-[#d4af37] text-[16px] shrink-0 mt-0.5 sm:mt-0">info</span>
                      <p className="text-[#d4af37] text-[10px] sm:text-xs font-medium tracking-wide">
                        {isAr ? 'يتطلب أن يكون المكان متأسساً كمنزل ذكي (Smart Home).' : 'Requires a pre-established Smart Home infrastructure.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group/card bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-5 md:p-6 hover:bg-white/[0.06] hover:border-white/30 transition-all duration-300 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-white/70">router</span>
                      <h4 className="font-bold text-lg md:text-xl text-white">{isAr ? 'ريموت كنترول' : 'Remote Control'}</h4>
                    </div>
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-4">
                      {isAr ? 'تشغيل لاسلكي مريح ومباشر للمساحات العادية بدون تعقيدات إضافية.' : 'Convenient wireless control for standard spaces without extra complexity.'}
                    </p>
                    <div className="flex items-start sm:items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="material-symbols-outlined text-white/50 text-[16px] shrink-0 mt-0.5 sm:mt-0">power</span>
                      <p className="text-white/60 text-[10px] sm:text-xs tracking-wide">
                        {isAr ? 'يتطلب فقط تأسيس طرفين سلك (أرضي وكهرباء) بجوار الستارة.' : 'Requires only a basic power setup (Live/Neutral) near the window.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Call to Action Inside the Box */}
            <div className="relative z-10 mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                   <span className="material-symbols-outlined text-white/50">support_agent</span>
                 </div>
                 <div>
                   <p className="text-white font-bold text-sm md:text-base">{isAr ? 'تحتاج مساعدة في الاختيار؟' : 'Need help choosing?'}</p>
                   <p className="text-white/50 text-xs">{isAr ? 'تواصل مع فريقنا الهندسي مجاناً' : 'Contact our engineering team for free'}</p>
                 </div>
              </div>
              <Link href={`/${isAr ? 'ar' : 'en'}/contact`} className="bg-[#FFFDFA] text-[#3E2723] px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#d4af37] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0">
                {isAr ? 'استشارة مجانية' : 'Free Consultation'}
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Grid of Cards */}
      {activeCategory !== "Smart" && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl items-start ${isAr ? "rtl text-right" : "ltr text-left"}`}>
          {filteredProducts.map((product) => (
            <ProductCardItem
              key={product.id}
              product={product}
              isAr={isAr}
            />
          ))}
        </div>
      )}
    </div>
  );
}
