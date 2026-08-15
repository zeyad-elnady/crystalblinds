"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/products";
import PageHero from "../../PageHero";
import { useCart } from "@/context/CartContext";

const STANDARD_SIZES = [
  { width: "1.0", height: "1.0", labelAr: "١.٠ × ١.٠ م", labelEn: "1.0 x 1.0 m" },
  { width: "1.0", height: "1.2", labelAr: "١.٠ × ١.٢ م", labelEn: "1.0 x 1.2 m" },
  { width: "1.4", height: "1.4", labelAr: "١.٤ × ١.٤ م", labelEn: "1.4 x 1.4 m" },
  { width: "1.5", height: "1.6", labelAr: "١.٥ × ١.٦ م", labelEn: "1.5 x 1.6 m" },
  { width: "1.6", height: "2.0", labelAr: "١.٦ × ٢.٠ م", labelEn: "1.6 x 2.0 m" },
  { width: "1.8", height: "2.2", labelAr: "١.٨ × ٢.٢ م", labelEn: "1.8 x 2.2 m" },
  { width: "2.0", height: "2.2", labelAr: "٢.٠ × ٢.٢ م", labelEn: "2.0 x 2.2 m" },
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
  const router = useRouter();
  const { addToCart, toggleCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [colorPreviewImage, setColorPreviewImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  
  const colors = product.colors || [];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors.length > 0 ? colors[0].id : null);
  const selectedColorObj = colors.find(c => c.id === selectedColor);

  const rawWidth = parseFloat(width) || 0;
  const rawHeight = parseFloat(height) || 0;
  
  // Convert legacy cm input (>20) to meters seamlessly if typed
  const widthVal = rawWidth > 20 ? rawWidth / 100 : rawWidth;
  const heightVal = rawHeight > 20 ? rawHeight / 100 : rawHeight;

  const area = widthVal > 0 && heightVal > 0 ? widthVal * heightVal : 1;
  const totalPrice = Math.round(product.price * area);

  const handleAddToCart = () => {
    if (!widthVal || !heightVal) {
      alert(isAr ? "يرجى إدخال المقاسات أولاً" : "Please enter dimensions first");
      return;
    }
    
    const colorName = selectedColorObj ? (isAr ? selectedColorObj.nameAr : selectedColorObj.nameEn) : "";
    const colorSuffix = colorName ? ` (${colorName})` : "";
    
    addToCart({
      id: `${product.id}_${widthVal}_${heightVal}_${selectedColor || ""}_${Date.now()}`,
      productId: product.id,
      labelEn: product.labelEn + colorSuffix,
      labelAr: product.labelAr + colorSuffix,
      image: colorPreviewImage || product.images[0] || "",
      price: totalPrice,
      quantity: 1,
      width: widthVal,
      height: heightVal,
      colorName: colorName,
      colorHex: selectedColorObj?.hex,
    });
  };

  const handleBuyNow = () => {
    if (!widthVal || !heightVal) {
      alert(isAr ? "يرجى إدخال المقاسات أولاً للمتابعة للشراء" : "Please enter dimensions first to proceed");
      return;
    }
    const colorName = selectedColorObj ? (isAr ? selectedColorObj.nameAr : selectedColorObj.nameEn) : "";
    const colorSuffix = colorName ? ` (${colorName})` : "";
    
    addToCart({
      id: `${product.id}_${widthVal}_${heightVal}_${selectedColor || ""}_${Date.now()}`,
      productId: product.id,
      labelEn: product.labelEn + colorSuffix,
      labelAr: product.labelAr + colorSuffix,
      image: colorPreviewImage || product.images[0] || "",
      price: totalPrice,
      quantity: 1,
      width: widthVal,
      height: heightVal,
      colorName: colorName,
      colorHex: selectedColorObj?.hex,
    });
    toggleCart(false);
    router.push(`/${locale}/checkout`);
  };

  const handleImageClick = () => {
    setLightboxImageIndex(currentImageIndex);
    setIsLightboxOpen(true);
  };

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-[#2C1D18] pb-28 ${isAr ? "rtl" : "ltr"}`}>
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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pt-10 md:pt-14">
        {/* Balanced 50/50 Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Product Gallery Column (50% Split) */}
          <div className="lg:col-span-6 flex flex-col gap-5 lg:sticky lg:top-24">
            
            {/* Gallery Layout: Tiny Thumbnails Side-by-Side with Main Image */}
            <div className="flex gap-3 md:gap-4 items-start">
              
              {/* Vertical Tiny Thumbnails Strip Next to Photo */}
              {product.images && product.images.length > 0 && (
                <div className="flex flex-col gap-2.5 w-16 sm:w-20 shrink-0">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setColorPreviewImage(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === idx && !colorPreviewImage
                          ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-105 shadow-sm"
                          : "border-[#3E2723]/10 opacity-75 hover:opacity-100 hover:border-[#3E2723]/30"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Product Image Container with Click-to-Zoom & Tight Border */}
              <div 
                onClick={handleImageClick}
                className="flex-1 relative w-full max-h-[75vh] h-[480px] md:h-[530px] rounded-xl overflow-hidden bg-white border border-[#3E2723]/15 shadow-xs flex items-center justify-center p-1 md:p-1.5 group transition-all cursor-zoom-in"
                title={isAr ? "انقر للتكبير" : "Click to enlarge"}
              >
                {/* Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-[#3E2723] shadow-xs border border-[#3E2723]/10">
                    {isAr ? product.category : product.category.toUpperCase()}
                  </span>
                </div>

                {/* Zoom Hint Icon */}
                <div className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-xs">
                  <span className="material-symbols-outlined text-base block">zoom_in</span>
                </div>

                {/* Main Image with object-contain for 100% full uncropped visibility */}
                <img
                  src={colorPreviewImage || product.images[currentImageIndex] || product.images[0]}
                  alt={product.alt}
                  className="w-full h-full max-h-[75vh] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Product Details & Features Accordion / Card */}
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#3E2723]/10 p-6 shadow-xs mt-1">
              <h3 className="font-headline font-bold text-base text-[#3E2723] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37] text-xl">description</span>
                {isAr ? "تفاصيل المنتج المميزة" : "Product Features & Details"}
              </h3>
              <p className="text-xs md:text-sm text-[#3E2723]/80 leading-relaxed mb-6">
                {isAr ? product.detailsAr : product.detailsEn}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-[#3E2723]/10 text-xs text-[#3E2723]/80 font-medium">
                <div className="flex items-center gap-2.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/5">
                  <span className="material-symbols-outlined text-[#d4af37] text-lg">verified</span>
                  <span>{isAr ? "خامات عالية الجودة ومقاومة" : "Premium & Durable Fabric"}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/5">
                  <span className="material-symbols-outlined text-[#d4af37] text-lg">palette</span>
                  <span>{isAr ? "تشكيلة ألوان أنيقة ومتنوعة" : "Wide Range of Rich Colors"}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/5">
                  <span className="material-symbols-outlined text-[#d4af37] text-lg">shield</span>
                  <span>{isAr ? "ضمان ممتد 3 سنوات" : "Extended 3-Year Warranty"}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/5">
                  <span className="material-symbols-outlined text-[#d4af37] text-lg">home</span>
                  <span>{isAr ? "تصميم عصري يناسب كافة الديكورات" : "Modern Fit for Any Interior"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details & Customization Column (50% Split) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Header: Title, Reviews, & Base Price Banner */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-6 md:p-7 shadow-xs flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-[#3E2723] leading-tight">
                    {isAr ? product.labelAr : product.labelEn}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-[#d4af37]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#3E2723]/70">(4.9/5)</span>
                    <span className="text-xs text-[#3E2723]/40">• 24 {isAr ? "تقييم" : "reviews"}</span>
                  </div>
                </div>

                <div className="bg-[#F7F4EF] border border-[#3E2723]/10 rounded-2xl px-4 py-3 flex flex-col items-end">
                  <span className="text-[11px] font-semibold text-[#3E2723]/60 uppercase tracking-wider">
                    {isAr ? "السعر يبدأ من" : "Starting Price"}
                  </span>
                  <div className="flex items-baseline gap-1 text-[#3E2723] font-black text-xl md:text-2xl mt-0.5">
                    <span>{product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                    <span className="text-xs font-bold text-[#3E2723]/60">{isAr ? "ج.م / م²" : "EGP / m²"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Form Container */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 overflow-hidden shadow-xs divide-y divide-[#3E2723]/10">
              
              {/* Size Section Header & Selector */}
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#3E2723]/15 flex items-center justify-center text-[#3E2723]">
                      <span className="material-symbols-outlined text-lg">straighten</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#3E2723]">
                        {isAr ? "مقاسات الستارة المطلوبة" : "Select Your Dimensions"}
                      </h2>
                      <p className="text-[11px] text-[#3E2723]/60">
                        {isAr ? "اختر من المقاسات القياسية أو أدخل مقاسك الخاص بالمتر" : "Choose a standard size or enter custom dimensions in meters"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Standard Sizes Pills in Meters */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-[#3E2723]/70 block mb-3">
                    {isAr ? "المقاسات القياسية السريعة (بالمتر):" : "Quick Standard Sizes (in meters):"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isActive
                              ? "bg-[#2C1D18] border-[#2C1D18] text-[#d4af37] shadow-md scale-[1.02]"
                              : "bg-[#FAF8F5] border-[#3E2723]/10 text-[#3E2723]/80 hover:border-[#d4af37] hover:bg-white"
                          }`}
                        >
                          <span>{isAr ? size.labelAr : size.labelEn}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setWidth("");
                        setHeight("");
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                        width === "" && height === ""
                          ? "bg-[#2C1D18] border-[#2C1D18] text-[#d4af37] shadow-md scale-[1.02]"
                          : "bg-[#FAF8F5] border-[#3E2723]/10 text-[#3E2723]/80 hover:border-[#d4af37] hover:bg-white"
                      }`}
                    >
                      {isAr ? "مقاس مخصص" : "Custom Size"}
                    </button>
                  </div>
                </div>

                {/* Custom Inputs in Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 md:p-5 rounded-2xl border border-[#3E2723]/10">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#3E2723]/80 flex items-center justify-between">
                      <span>{isAr ? "العرض المطلوب (متر)" : "Width (meters)"}</span>
                      <span className="text-[10px] font-normal text-[#3E2723]/50">(0.4 - 6.0 {isAr ? "متر" : "m"})</span>
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder={isAr ? "مثال: 1.5" : "e.g. 1.5"}
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full bg-white border border-[#3E2723]/20 rounded-xl px-4 py-3 text-sm font-bold text-[#3E2723] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                        dir="ltr"
                      />
                      <span className="absolute right-3 text-xs font-bold text-[#3E2723]/40 pointer-events-none">
                        {isAr ? "متر" : "m"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#3E2723]/80 flex items-center justify-between">
                      <span>{isAr ? "الارتفاع المطلوب (متر)" : "Height (meters)"}</span>
                      <span className="text-[10px] font-normal text-[#3E2723]/50">(0.4 - 2.75 {isAr ? "متر" : "m"})</span>
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder={isAr ? "مثال: 1.8" : "e.g. 1.8"}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-white border border-[#3E2723]/20 rounded-xl px-4 py-3 text-sm font-bold text-[#3E2723] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                        dir="ltr"
                      />
                      <span className="absolute right-3 text-xs font-bold text-[#3E2723]/40 pointer-events-none">
                        {isAr ? "متر" : "m"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Measurement Links */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3E2723]/70 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#d4af37] text-base">straighten</span>
                    <span>
                      {isAr ? "حائر في القياس؟ " : "Unsure about dimensions? "}
                      <a href="#" className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#3E2723]">{isAr ? "دليل رفع القياسات" : "Measuring guide"}</a>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#d4af37] text-base">construction</span>
                    <Link href={`/${locale}/contact`} className="font-bold underline decoration-[#d4af37] underline-offset-4 text-[#3E2723]">
                      {isAr ? "طلب خدمة تركيب احترافية" : "Request Installation Service"}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              {colors.length > 0 && (
                <div className="p-6 md:p-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#3E2723]/15 flex items-center justify-center text-[#3E2723]">
                        <span className="material-symbols-outlined text-lg">palette</span>
                      </div>
                      <h3 className="font-bold text-base text-[#3E2723]">{isAr ? "اختر اللون المناسب" : "Select Color"}</h3>
                    </div>
                    <span className="text-xs font-semibold text-[#3E2723]/60 bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#3E2723]/10">
                      {colors.length} {isAr ? "ألوان متوفرة" : "Colors available"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {colors.map((c) => {
                      const isSelected = selectedColor === c.id;
                      return (
                        <div key={c.id} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (c.isSoldOut) return;
                              setSelectedColor(c.id);
                              setColorPreviewImage(c.image || null);
                            }}
                            disabled={c.isSoldOut}
                            title={isAr ? c.nameAr : c.nameEn}
                            className={`relative w-12 h-12 rounded-xl border-2 transition-all p-1 shadow-xs flex items-center justify-center ${
                              isSelected
                                ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-110"
                                : "border-[#3E2723]/15 hover:border-[#3E2723]/40"
                            } ${c.isSoldOut ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <div className="w-full h-full rounded-lg border border-black/10" style={{ backgroundColor: c.hex }} />
                            {isSelected && (
                              <span className="absolute text-white material-symbols-outlined text-sm font-bold drop-shadow-md">
                                check
                              </span>
                            )}
                            {c.isSoldOut && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-0.5 bg-red-600 rotate-45 absolute" />
                              </div>
                            )}
                          </button>
                          <span className={`text-[10px] font-bold ${isSelected ? "text-[#3E2723]" : "text-[#3E2723]/60"}`}>
                            {isAr ? c.nameAr : c.nameEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price Banner & Action Buttons */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-md">
              {/* Premium dark gradient header */}
              <div className="bg-[#2C1D18] p-6 text-white flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white/60 text-[11px] font-bold tracking-widest uppercase">
                    {isAr ? "الإجمالي المستحق" : "Total Price"}
                  </span>
                  <div className="flex items-baseline gap-2" dir="ltr">
                    <span className="text-white font-black text-3xl md:text-4xl tracking-tight">
                      {totalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                    <span className="text-white/80 font-bold text-base">{isAr ? "ج.م" : "EGP"}</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {isAr
                      ? `${area.toFixed(2)} م² (بناءً على مقاساتك المحددة بالمتر)`
                      : `${area.toFixed(2)} m² based on your custom size in meters`
                    }
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
                    <span className="material-symbols-outlined text-[#d4af37] text-sm">workspace_premium</span>
                    <span className="text-white/90 font-medium">{isAr ? "ضمان 3 سنوات" : "3-Year Guarantee"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">local_shipping</span>
                    <span className="text-white/90 font-medium">{isAr ? "شحن لجميع المحافظات" : "Nationwide Shipping"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="bg-white p-6 flex flex-col gap-3">
                {product.is_active === false ? (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">remove_shopping_cart</span>
                    {isAr ? "غير متوفر حالياً" : "Out of Stock"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full bg-[#2C1D18] hover:bg-[#3E2723] text-white border border-[#C5A059]/40 py-4 rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    {isAr ? "اشتري الآن" : "Buy Now"}
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {product.is_active !== false && (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 bg-[#FAF8F5] border border-[#3E2723]/20 hover:border-[#d4af37] text-[#3E2723] hover:text-[#b8922a] py-3.5 rounded-xl font-bold text-xs transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                      {isAr ? "أضف للسلة" : "Add to Cart"}
                    </button>
                  )}
                  <Link
                    href={`/${locale}/#reserve`}
                    className={`flex items-center justify-center gap-2 bg-[#FAF8F5] border border-[#3E2723]/20 hover:border-[#3E2723]/50 text-[#3E2723] py-3.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                      product.is_active === false ? "col-span-2" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                    {isAr ? "احجز معاينة مجانية" : "Book Visit"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Footer Card */}
            <div className="bg-white/60 rounded-2xl border border-[#3E2723]/10 p-5 flex items-center justify-between text-xs text-[#3E2723]/70 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">verified_user</span>
                <span>{isAr ? "دفع آمن 100% ومعتمد" : "100% Secure Checkout"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">headset_mic</span>
                <span>{isAr ? "دعم وتواصل مستمر" : "Dedicated Support"}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="w-full flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs md:text-sm font-semibold opacity-70">
              {isAr ? product.labelAr : product.labelEn} ({lightboxImageIndex + 1} / {product.images.length})
            </span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <span className="material-symbols-outlined block">close</span>
            </button>
          </div>

          {/* Lightbox Center: Image with Prev/Next Navigation */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto" onClick={(e) => e.stopPropagation()}>
            {product.images.length > 1 && (
              <button 
                onClick={() => setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs"
              >
                <span className="material-symbols-outlined text-2xl block">chevron_left</span>
              </button>
            )}

            <img 
              src={product.images[lightboxImageIndex]} 
              alt={`${product.alt} Full Preview`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {product.images.length > 1 && (
              <button 
                onClick={() => setLightboxImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs"
              >
                <span className="material-symbols-outlined text-2xl block">chevron_right</span>
              </button>
            )}
          </div>

          {/* Lightbox Footer: Thumbnails strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 max-w-md overflow-x-auto py-2 z-10" onClick={(e) => e.stopPropagation()}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxImageIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    lightboxImageIndex === idx ? "border-[#d4af37] scale-105" : "border-white/30 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
