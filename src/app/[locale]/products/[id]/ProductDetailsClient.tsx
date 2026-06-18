"use client";

import { useState } from "react";
import Link from "next/link";
import { type Product } from "@/lib/products";
import PageHero from "../../PageHero";

const STANDARD_SIZES = [
  { width: "100", height: "100", labelAr: "١٠٠ × ١٠٠ سم", labelEn: "100 x 100 cm" },
  { width: "120", height: "120", labelAr: "١٠٠ × ١٢٠ سم", labelEn: "120 x 120 cm" },
  { width: "140", height: "140", labelAr: "١٤٠ × ١٤٠ سم", labelEn: "140 x 140 cm" },
  { width: "150", height: "160", labelAr: "١٥٠ × ١٦٠ سم", labelEn: "150 x 160 cm" },
  { width: "160", height: "200", labelAr: "١٦٠ × ٢٠٠ سم", labelEn: "160 x 200 cm" },
  { width: "180", height: "220", labelAr: "١٨٠ × ٢٢٠ سم", labelEn: "180 x 220 cm" },
  { width: "200", height: "220", labelAr: "٢٠٠ × ٢٢٠ سم", labelEn: "200 x 220 cm" },
];

export default function ProductDetailsClient({
  product,
  isAr,
  locale,
}: {
  product: Product;
  isAr: boolean;
  locale: string;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [colorPreviewImage, setColorPreviewImage] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  
  const colors = product.colors || [];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors.length > 0 ? colors[0].id : null);

  const widthVal = parseFloat(width) || 0;
  const heightVal = parseFloat(height) || 0;
  const area = widthVal > 0 && heightVal > 0 ? (widthVal / 100) * (heightVal / 100) : 1;
  const totalPrice = Math.round(product.price * area);

  return (
    <div className={`min-h-screen bg-[#FFFDFA] text-[#3E2723] pb-24 ${isAr ? "rtl" : "ltr"}`}>
      <PageHero
        title={isAr ? product.labelAr : product.labelEn}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "المنتجات" : "Products", href: `/${locale}/products` },
          { label: isAr ? product.labelAr : product.labelEn },
        ]}
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Images and Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">

            {/* Gallery */}
            <div className="flex gap-4">
              {/* Thumbnails */}
              <div className="flex flex-col gap-3 w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      currentImageIndex === idx ? "border-[#d4af37]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="flex-1 relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FFFDFA]/50 border border-[#3E2723]/10 shadow-sm group">
                <div className="absolute top-4 w-full text-center z-10 pointer-events-none">
                  <span className="bg-[#FFFDFA]/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#3E2723] shadow-sm">
                    {isAr ? product.category : product.category.toUpperCase()}
                  </span>
                </div>
                <img
                  src={colorPreviewImage || product.images[currentImageIndex]}
                  alt={product.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Description & Features */}
            <div className={`mt-4 ${isAr ? "text-right" : "text-left"}`}>
              <p className="text-[#3E2723]/80 leading-relaxed mb-6">
                {isAr ? product.detailsAr : product.detailsEn}
              </p>
              
              <div className="w-full h-px bg-[#3E2723]/10 my-8 relative flex justify-center">
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-[#FFFDFA] border border-[#3E2723]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-[#d4af37]">add</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-[#3E2723]/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-[18px]">check</span>
                  <span>{isAr ? "مواد عالية الجودة" : "High Quality Material"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-[18px]">check</span>
                  <span className="underline decoration-[#d4af37] underline-offset-4">{isAr ? "ألوان داكنة متاحة" : "Dark colours available"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-[18px]">check</span>
                  <span>{isAr ? "ضمان ممتد" : "Extended Warranty"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-[18px]">check</span>
                  <span>{isAr ? "مثالية للمنازل العصرية" : "Perfect for modern homes"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-[18px]">check</span>
                  <span>{isAr ? "تشطيب فاخر" : "Premium finish"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customization */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Title, Stars & Starting Price (moved here for clean layout) */}
            <div className={`${isAr ? "text-right" : "text-left"} border-b border-[#3E2723]/10 pb-4`}>
              <div className="text-[#d4af37] font-bold text-2xl">
                {isAr ? "يبدأ من" : "from"} {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-[#d4af37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
                <span className="text-[#3E2723]/50 text-xs ml-2">(24 reviews)</span>
              </div>
            </div>

            <div className={`border-b border-[#3E2723] pb-2 ${isAr ? "text-right" : "text-left"}`}>
              <h2 className="font-headline text-lg font-bold text-[#3E2723]">
                {isAr ? "قم بتخصيص منتجك" : "Customize your product"}
              </h2>
            </div>

            <div className="bg-[#f2ece4]/50 border border-[#3E2723]/5 rounded-xl flex flex-col divide-y divide-[#3E2723]/10 overflow-hidden shadow-sm">
              
              {/* Measurements */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-[#3E2723]">{isAr ? "مقاسات منتجك" : "Measurements of your product"}</h3>
                  <span className="material-symbols-outlined text-[16px] text-[#3E2723]/40">info</span>
                </div>
                
                {/* Standard Sizes Selection */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#3E2723]/60 block mb-2">
                    {isAr ? "المقاسات القياسية (أو أدخل مقاسك بالأسفل):" : "Standard sizes (or enter custom sizes below):"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map((size, index) => {
                      const isActive = width === size.width && height === size.height;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setWidth(size.width);
                            setHeight(size.height);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isActive
                              ? "bg-[#3E2723] border-[#3E2723] text-white shadow-sm"
                              : "bg-[#FFFDFA] border-[#3E2723]/10 text-[#3E2723]/80 hover:border-[#d4af37] hover:text-[#d4af37]"
                          }`}
                        >
                          {isAr ? size.labelAr : size.labelEn}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setWidth("");
                        setHeight("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        width === "" && height === ""
                          ? "bg-[#3E2723] border-[#3E2723] text-white shadow-sm"
                          : "bg-[#FFFDFA] border-[#3E2723]/10 text-[#3E2723]/80 hover:border-[#d4af37] hover:text-[#d4af37]"
                      }`}
                    >
                      {isAr ? "مقاس مخصص" : "Custom"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#3E2723]/60">{isAr ? "العرض (سم)" : "Width cm"}</label>
                    <input 
                      type="number" 
                      placeholder={isAr ? "من 40 إلى 600 سم" : "40 up to 600cm"}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="bg-[#FFFDFA] border border-[#3E2723]/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#3E2723]/60">{isAr ? "الارتفاع (سم)" : "Height cm"}</label>
                    <input 
                      type="number" 
                      placeholder={isAr ? "من 40 إلى 275 سم" : "40 up to 275cm"}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-[#FFFDFA] border border-[#3E2723]/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-xs text-[#3E2723]/70">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#3E2723]/40 shrink-0">straighten</span>
                    <p>
                      {isAr ? "اتبع " : "Follow our "}
                      <a href="#" className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#3E2723]">{isAr ? "دليل القياسات" : "measuring guide"}</a>
                      {isAr ? " للحصول على نتيجة مثالية. قم بذلك بنفسك لتوفير الوقت والمال." : " for a perfect result. Do it yourself! faster and cheaper."}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-[18px] text-[#3E2723]/40 shrink-0">construction</span>
                    <p>
                      {isAr ? "تحتاج لتركيب؟ " : "Need installation? "}
                      <Link href={`/${locale}/contact`} className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#3E2723]">{isAr ? "تواصل معنا" : "Contact our experts"}</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-[#3E2723]">{isAr ? "تغيير اللون" : "Change color"}</h3>
                    <span className="text-[10px] text-[#3E2723]/50 bg-[#FFFDFA] px-2 py-0.5 rounded border border-[#3E2723]/10">
                      {isAr ? "+٢٦ لون" : "+ 26 colors"}
                    </span>
                  </div>
                  <button className="material-symbols-outlined text-[18px] text-[#3E2723]/40 hover:text-[#3E2723]">close</button>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="w-8 h-8 flex items-center justify-center text-[#3E2723]/40 hover:text-[#d4af37] shrink-0">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-2">
                    {colors.length === 0 && (
                      <span className="text-sm text-[#3E2723]/50">{isAr ? "لا توجد ألوان متاحة حالياً" : "No colors available currently"}</span>
                    )}
                    {colors.map((c) => (
                      <div key={c.id} className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => {
                            if (c.isSoldOut) return;
                            setSelectedColor(c.id);
                            setColorPreviewImage(c.image || null);
                          }}
                          disabled={c.isSoldOut}
                          className={`relative w-[60px] h-[60px] rounded border shadow-sm transition-all p-1 ${selectedColor === c.id ? "border-[#d4af37] bg-[#FFFDFA]" : "border-[#3E2723]/15 hover:border-[#3E2723]/30"} ${c.isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="w-full h-full rounded-sm border border-[#3E2723]/5" style={{ backgroundColor: c.hex }} />
                          {c.isSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                              <div className="w-full h-0.5 bg-red-500 -rotate-45 absolute" />
                            </div>
                          )}
                        </button>
                        <span className={`text-[10px] mt-1 ${c.isSoldOut ? "text-red-500 font-bold" : "text-[#3E2723]/60"}`}>
                          {c.isSoldOut ? (isAr ? "نفذت" : "Sold Out") : (isAr ? c.nameAr : c.nameEn)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="w-8 h-8 flex items-center justify-center text-[#3E2723]/40 hover:text-[#d4af37] shrink-0">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>



            </div>

            {/* Price Box */}
            <div className={`flex flex-col sm:flex-row gap-6 items-center justify-between p-6 md:p-8 bg-[#FFFDFA] border border-[#3E2723]/10 rounded-xl shadow-[0_10px_30px_rgba(38,23,12,0.03)] ${isAr ? "flex-row-reverse" : ""}`}>
              <div className={`flex flex-col gap-1 ${isAr ? "text-right" : "text-left"}`}>
                <span className="text-[#3E2723] font-bold text-2xl">
                  {totalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
                </span>
                <span className="text-xs text-[#3E2723]/60 font-medium mt-1" dir="rtl">
                  {isAr ? 
                    `المساحة ${area.toFixed(2)} م² × سعر المتر ${product.price} ج.م` : 
                    `Area ${area.toFixed(2)} m² × Meter price ${product.price} EGP`}
                </span>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <Link 
                  href={`/${locale}/#reserve`}
                  className="flex-1 sm:flex-none bg-[#FFFDFA] text-[#d4af37] border-2 border-[#d4af37] px-8 py-3.5 rounded-lg font-bold shadow-sm hover:bg-[#FFFDFA] hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
                >
                  {isAr ? "احجز معاينة" : "Book Visit"}
                </Link>
                {product.is_active === false ? (
                  <button 
                    disabled
                    className="flex-1 sm:flex-none bg-gray-400 text-white px-8 py-3.5 rounded-lg font-bold shadow-sm text-center whitespace-nowrap cursor-not-allowed"
                  >
                    {isAr ? "نفذت الكمية" : "Sold Out"}
                  </button>
                ) : (
                  <Link 
                    href={`/${locale}/checkout/${product.id}?width=${width}&height=${height}&color=${selectedColor}&pieces=1`}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-[#d4af37] to-[#b8922a] text-white px-8 py-3.5 rounded-lg font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
                  >
                    {isAr ? "اشتري الآن" : "Buy Now"}
                  </Link>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className={`flex items-center justify-between p-4 bg-[#f2ece4]/30 border border-[#3E2723]/5 rounded-lg text-[10px] sm:text-xs text-[#3E2723]/70 ${isAr ? "flex-row-reverse" : ""}`}>
              <span className="font-bold text-[#3E2723]">{isAr ? "شحن عادي" : "Standard shipping"}</span>
              <span>{isAr ? "متوقع التسليم خلال أسبوعين" : "Estimated shipping in 2 weeks"}</span>
            </div>

            {/* Trust Info */}
            <div className={`mt-2 border-t-2 border-[#3E2723] pt-4 ${isAr ? "text-right" : "text-left"}`}>
              <h3 className="font-headline text-lg font-bold text-[#3E2723] mb-6">
                {isAr ? "يمكنك الوثوق في كريستال بليندز" : "You can trust in Crystal Blinds"}
              </h3>
              
              <div className="flex flex-col gap-5">
                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="material-symbols-outlined text-[24px] text-[#3E2723]/50">workspace_premium</span>
                  <div className="text-sm">
                    <span className="font-bold text-[#3E2723]">{isAr ? "الضمان " : "Warranty "}</span>
                    <span className="text-[#3E2723]/70">{isAr ? "٣ سنوات" : "3 years"}</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#3E2723]/60">
                  {isAr ? "أكثر من " : "More than "}
                  <span className="font-bold text-[#3E2723]">{isAr ? "١ مليون" : "1 million"}</span>
                  {isAr ? " نافذة تم تزيينها بمنتجاتنا" : " decorated windows"}
                </p>

                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="material-symbols-outlined text-[24px] text-[#3E2723]/50">support_agent</span>
                  <div className="text-sm">
                    <Link href={`/${locale}/contact`} className="font-bold text-[#3E2723] underline decoration-[#d4af37] underline-offset-4">{isAr ? "خدمة العملاء " : "Customer service "}</Link>
                    <span className="text-[#3E2723]/70">{isAr ? "مجانية ومتاحة دائماً" : "gratuitous & available"}</span>
                  </div>
                </div>

                <div className={`flex items-center gap-2 mt-2 ${isAr ? "flex-row-reverse" : ""}`}>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="material-symbols-outlined text-[#d4af37] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-[#3E2723]/60">
                    {isAr ? "٣١,٨٢٠ مراجعة" : "31,820 reviews"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
