"use client";

import { useState } from "react";
import Link from "next/link";
import { type Product } from "@/lib/products";

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
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedPieces, setSelectedPieces] = useState(1);

  const colors = [
    { id: 0, bg: "bg-[#e5d9c5]", nameEn: "Ivory", nameAr: "عاجي" },
    { id: 1, bg: "bg-[#d1cbbd]", nameEn: "Sand", nameAr: "رملي" },
    { id: 2, bg: "bg-[#8c8c8c]", nameEn: "Pearl", nameAr: "لؤلؤي" },
    { id: 3, bg: "bg-[#a6968d]", nameEn: "Taupe", nameAr: "طوبي" },
  ];

  const types = [
    { id: 0, nameEn: "Pinch Pleat", nameAr: "كسرات" },
    { id: 1, nameEn: "Pencil Pleat", nameAr: "قلم" },
    { id: 2, nameEn: "Tempo Wave", nameAr: "ويف" },
    { id: 3, nameEn: "Eyelets", nameAr: "حلقات" },
  ];

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
    { name: isAr ? "المنتجات" : "Products", href: `/${locale}/products` },
    { name: isAr ? product.labelAr : product.labelEn, href: "#" },
  ];

  return (
    <div className={`min-h-screen bg-[#faf8f5] text-[#26170c] pt-32 pb-24 ${isAr ? "rtl" : "ltr"}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#26170c]/60 mb-8">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Link href={crumb.href} className="hover:text-[#d4af37] transition-colors">
                {crumb.name}
              </Link>
              {idx < breadcrumbs.length - 1 && (
                <span className={`material-symbols-outlined text-sm ${isAr ? "rotate-180" : ""}`}>
                  chevron_right
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Images and Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Title & Price Header */}
            <div className={`flex flex-col gap-2 ${isAr ? "text-right" : "text-left"}`}>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#26170c]">
                {isAr ? product.labelAr : product.labelEn}
              </h1>
              <div className="text-[#d4af37] font-bold text-xl mt-2">
                {isAr ? "يبدأ من" : "from"} {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-[#d4af37] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
                <span className="text-[#26170c]/50 text-xs ml-2">(24)</span>
              </div>
            </div>

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
              <div className="flex-1 relative aspect-[4/5] rounded-xl overflow-hidden bg-white/50 border border-[#26170c]/10 shadow-sm group">
                <div className="absolute top-4 w-full text-center z-10 pointer-events-none">
                  <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#26170c] shadow-sm">
                    {isAr ? product.category : product.category.toUpperCase()}
                  </span>
                </div>
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Description & Features */}
            <div className={`mt-4 ${isAr ? "text-right" : "text-left"}`}>
              <p className="text-[#26170c]/80 leading-relaxed mb-6">
                {isAr ? product.detailsAr : product.detailsEn}
              </p>
              
              <div className="w-full h-px bg-[#26170c]/10 my-8 relative flex justify-center">
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-[#faf8f5] border border-[#26170c]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-[#d4af37]">add</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-[#26170c]/70">
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
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className={`border-b-2 border-[#26170c] pb-3 ${isAr ? "text-right" : "text-left"}`}>
              <h2 className="font-headline text-2xl font-bold text-[#26170c]">
                {isAr ? "قم بتخصيص منتجك" : "Customize your product"}
              </h2>
            </div>

            <div className="bg-[#f2ece4]/50 border border-[#26170c]/5 rounded-xl flex flex-col divide-y divide-[#26170c]/10 overflow-hidden shadow-sm">
              
              {/* Measurements */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-[#26170c]">{isAr ? "مقاسات منتجك" : "Measurements of your product"}</h3>
                  <span className="material-symbols-outlined text-[16px] text-[#26170c]/40">info</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#26170c]/60">{isAr ? "العرض (سم)" : "Width cm"}</label>
                    <input 
                      type="number" 
                      placeholder={isAr ? "من 40 إلى 600 سم" : "40 up to 600cm"}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="bg-white border border-[#26170c]/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#26170c]/60">{isAr ? "الارتفاع (سم)" : "Height cm"}</label>
                    <input 
                      type="number" 
                      placeholder={isAr ? "من 40 إلى 275 سم" : "40 up to 275cm"}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-white border border-[#26170c]/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-xs text-[#26170c]/70">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#26170c]/40 shrink-0">straighten</span>
                    <p>
                      {isAr ? "اتبع " : "Follow our "}
                      <a href="#" className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#26170c]">{isAr ? "دليل القياسات" : "measuring guide"}</a>
                      {isAr ? " للحصول على نتيجة مثالية. قم بذلك بنفسك لتوفير الوقت والمال." : " for a perfect result. Do it yourself! faster and cheaper."}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-[18px] text-[#26170c]/40 shrink-0">construction</span>
                    <p>
                      {isAr ? "تحتاج لتركيب؟ " : "Need installation? "}
                      <Link href={`/${locale}/contact`} className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#26170c]">{isAr ? "تواصل معنا" : "Contact our experts"}</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-[#26170c]">{isAr ? "تغيير اللون" : "Change color"}</h3>
                    <span className="text-[10px] text-[#26170c]/50 bg-white px-2 py-0.5 rounded border border-[#26170c]/10">
                      {isAr ? "+٢٦ لون" : "+ 26 colors"}
                    </span>
                  </div>
                  <button className="material-symbols-outlined text-[18px] text-[#26170c]/40 hover:text-[#26170c]">close</button>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="w-8 h-8 flex items-center justify-center text-[#26170c]/40 hover:text-[#d4af37] shrink-0">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-2">
                    {colors.map((c) => (
                      <div key={c.id} className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => setSelectedColor(c.id)}
                          className={`w-[60px] h-[60px] rounded border shadow-sm transition-all p-1 ${selectedColor === c.id ? "border-[#d4af37] bg-white" : "border-[#26170c]/15 hover:border-[#26170c]/30"}`}
                        >
                          <div className={`w-full h-full rounded-sm ${c.bg} border border-[#26170c]/5`} />
                        </button>
                        <span className="text-[10px] text-[#26170c]/60">{isAr ? c.nameAr : c.nameEn}</span>
                        <button className="text-[9px] border border-[#d4af37] text-[#d4af37] rounded-full px-2 py-0.5 font-bold uppercase hover:bg-[#d4af37] hover:text-white transition-colors">
                          {isAr ? "عينة مجانية" : "Samples free"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button className="w-8 h-8 flex items-center justify-center text-[#26170c]/40 hover:text-[#d4af37] shrink-0">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <div className="mt-5 flex gap-3 text-xs text-[#26170c]/70 items-start">
                  <span className="material-symbols-outlined text-[18px] text-[#26170c]/40 shrink-0">tips_and_updates</span>
                  <p>
                    <span className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#26170c]">{isAr ? "نصيحة:" : "Advice:"}</span>
                    {isAr ? " لضمان اللون المناسب، اختر العينات المجانية الخاصة بك." : " for a good color check, choose your FREE samples."}
                  </p>
                </div>
              </div>

              {/* Type of Curtains */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-[#26170c]">{isAr ? "نوع الستارة" : "Type of curtains"}</h3>
                  <span className="material-symbols-outlined text-[16px] text-[#26170c]/40">info</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {types.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`flex flex-col items-center gap-2 p-2 rounded border bg-white transition-all ${
                        selectedType === t.id ? "border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.15)] ring-1 ring-[#d4af37]/20" : "border-[#26170c]/10 hover:border-[#26170c]/30"
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-[#faf8f5] border border-[#26170c]/5 rounded flex items-center justify-center text-[#26170c]/20">
                        <span className="material-symbols-outlined opacity-50">curtains</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#26170c] whitespace-nowrap text-center">{isAr ? t.nameAr : t.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pieces */}
              <div className={`p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-[#26170c]">{isAr ? "عدد القطع للشباك؟" : "How many pieces per window?"}</h3>
                  <span className="material-symbols-outlined text-[16px] text-[#26170c]/40">info</span>
                </div>
                
                <div className="flex gap-4">
                  {[1, 2].map((num) => (
                    <button 
                      key={num}
                      onClick={() => setSelectedPieces(num)}
                      className={`flex flex-col items-center gap-2 w-16 transition-all ${selectedPieces === num ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
                    >
                      <div className={`w-full aspect-square border-2 bg-white rounded flex items-center justify-center ${selectedPieces === num ? "border-[#26170c]" : "border-[#26170c]/20"}`}>
                        <div className={`w-8 h-8 border border-[#26170c]/20 flex ${num === 2 ? "divide-x divide-[#26170c]/20" : ""}`}>
                          {num === 2 ? <><div className="flex-1 bg-[#faf8f5]"></div><div className="flex-1 bg-[#faf8f5]"></div></> : <div className="flex-1 bg-[#faf8f5]"></div>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold ${selectedPieces === num ? "text-[#26170c]" : "text-[#26170c]/60"}`}>
                        {num} {isAr ? (num === 1 ? "قطعة" : "قطعتين") : (num === 1 ? "piece" : "pieces")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className={`flex flex-col sm:flex-row gap-6 items-center justify-between p-6 md:p-8 bg-white border border-[#26170c]/10 rounded-xl shadow-[0_10px_30px_rgba(38,23,12,0.03)] ${isAr ? "flex-row-reverse" : ""}`}>
              <div className={`flex flex-col gap-1 ${isAr ? "text-right" : "text-left"}`}>
                <span className="text-[#26170c] font-bold">{isAr ? "خصم ٢٥٪" : "-25% off"}</span>
                <span className="text-xs text-[#26170c]/60 font-medium">
                  {isAr ? "تخصيص كامل للمنتج حسب طلبك" : "Fully customized to your needs"}
                </span>
              </div>
              
              <Link 
                href={`/${locale}/#reserve`}
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] to-[#b8922a] text-white px-8 py-3.5 rounded-lg font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all text-center"
              >
                {isAr ? "احجز السعر الآن" : "Calculate price"}
              </Link>
            </div>

            {/* Shipping Info */}
            <div className={`flex items-center justify-between p-4 bg-[#f2ece4]/30 border border-[#26170c]/5 rounded-lg text-[10px] sm:text-xs text-[#26170c]/70 ${isAr ? "flex-row-reverse" : ""}`}>
              <span className="font-bold text-[#26170c]">{isAr ? "شحن عادي" : "Standard shipping"}</span>
              <span>{isAr ? "متوقع التسليم خلال أسبوعين" : "Estimated shipping in 2 weeks"}</span>
            </div>

            {/* Trust Info */}
            <div className={`mt-2 border-t-2 border-[#26170c] pt-4 ${isAr ? "text-right" : "text-left"}`}>
              <h3 className="font-headline text-lg font-bold text-[#26170c] mb-6">
                {isAr ? "يمكنك الوثوق في كريستال بليندز" : "You can trust in Crystal Blinds"}
              </h3>
              
              <div className="flex flex-col gap-5">
                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="material-symbols-outlined text-[24px] text-[#26170c]/50">workspace_premium</span>
                  <div className="text-sm">
                    <span className="font-bold text-[#26170c]">{isAr ? "الضمان " : "Warranty "}</span>
                    <span className="text-[#26170c]/70">{isAr ? "٣ سنوات" : "3 years"}</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#26170c]/60">
                  {isAr ? "أكثر من " : "More than "}
                  <span className="font-bold text-[#26170c]">{isAr ? "١ مليون" : "1 million"}</span>
                  {isAr ? " نافذة تم تزيينها بمنتجاتنا" : " decorated windows"}
                </p>

                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="material-symbols-outlined text-[24px] text-[#26170c]/50">support_agent</span>
                  <div className="text-sm">
                    <Link href={`/${locale}/contact`} className="font-bold text-[#26170c] underline decoration-[#d4af37] underline-offset-4">{isAr ? "خدمة العملاء " : "Customer service "}</Link>
                    <span className="text-[#26170c]/70">{isAr ? "مجانية ومتاحة دائماً" : "gratuitous & available"}</span>
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
                  <span className="text-xs text-[#26170c]/60">
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
