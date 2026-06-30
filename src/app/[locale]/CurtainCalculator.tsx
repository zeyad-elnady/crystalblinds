"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "zebra",
    labelAr: "ستائر زيبرا",
    labelEn: "Zebra Blinds",
    price: 1650,
    images: ["/photos for crystal/ستائر زيبرا.jpeg"],
    descAr: "تصميم عصري متدرج",
    descEn: "Modern Graduated Design",
    detailsAr: "تتميز بأشرطة قماشية شفافة وصلبة متناوبة، مما يمنحك تحكماً مرناً في ترشيح الضوء والخصوصية في تصميم واحد رائع.",
    detailsEn: "Features alternating sheer and solid fabric bands, giving you flexible control over light filtering and privacy in one brilliant design.",
    alt: "Zebra Blinds",
    category: "Modern",
    is_active: true,
    colors: []
  },
  {
    id: "blackout",
    labelAr: "ستائر رول بلاك أوت",
    labelEn: "Blackout Roller Blinds",
    price: 1450,
    images: ["/photos for crystal/ستائر رول بلاك أوت.jpeg"],
    descAr: "عزل مطلق للضوء والحرارة",
    descEn: "Absolute Light & Heat Insulation",
    detailsAr: "مصممة لحجب أشعة الشمس والأشعة فوق البنفسجية بالكامل، مما يضمن أقصى درجات الخصوصية وبيئة مريحة في أي وقت.",
    detailsEn: "Crafted to completely block out sunlight and UV rays, ensuring maximum privacy and a restful environment anytime.",
    alt: "Blackout Roller Blinds",
    category: "Roller",
    is_active: true,
    colors: []
  },
  {
    id: "sunscreen",
    labelAr: "ستائر رول صن سكرين",
    labelEn: "Sunscreen Roller Blinds",
    price: 1300,
    images: ["/photos for crystal/ستائر رول صن سكرين.jpeg"],
    descAr: "حماية ذكية وإضاءة طبيعية",
    descEn: "Smart Protection & Natural Light",
    detailsAr: "تسمح لك بالحفاظ على الرؤية مع تقليل الوهج والحرارة، مثالية لمساحات المعيشة التي تحتاج إلى إضاءة طبيعية.",
    detailsEn: "Allows you to maintain your view while reducing glare and heat, perfect for living spaces that need natural lighting.",
    alt: "Sunscreen Roller Blinds",
    category: "Roller",
    is_active: true,
    colors: []
  },
  {
    id: "vertical",
    labelAr: "ستائر شرائح رأسية",
    labelEn: "Vertical Blinds",
    price: 1100,
    images: ["/photos for crystal/ستائر شرائح راسيه.jpeg"],
    descAr: "تحكم مرن للمساحات الواسعة",
    descEn: "Flexible Control for Wide Spaces",
    detailsAr: "مثالية للنوافذ الكبيرة والأبواب المنزلقة، توفر تحكماً ممتازاً في الإضاءة ومظهراً عصرياً وأنيقاً.",
    detailsEn: "Ideal for large windows and sliding doors, offering excellent light control and a sleek, contemporary appearance.",
    alt: "Vertical Blinds",
    category: "Classic",
    is_active: true,
    colors: []
  },
  {
    id: "metallic",
    labelAr: "ستائر شرائح معدنية/خشبية",
    labelEn: "Metallic/Wooden Blinds",
    price: 1850,
    images: ["/photos for crystal/ستائر شرائح معدنية.jpeg"],
    descAr: "متانة وفخامة لكل ذوق",
    descEn: "Durability & Luxury for Every Taste",
    detailsAr: "مصممة لتدوم وتتميز بالأناقة، تقدم هذه الستائر مظهراً خالداً مع إمكانية تعديل سهلة لأي تصميم داخلي حديث.",
    detailsEn: "Engineered for longevity and style, these blinds offer a timeless look with effortless adjustability for any modern interior.",
    alt: "Metallic Blinds",
    category: "Classic",
    is_active: true,
    colors: []
  },
  {
    id: "double",
    labelAr: "ستائر دبل سيستم",
    labelEn: "Double System Blinds",
    price: 2100,
    images: ["/photos for crystal/ستائر دبل سيستم.jpeg"],
    descAr: "ذكاء مزدوج وإمكانيات غير محدودة",
    descEn: "Dual Intelligence & Unlimited Possibilities",
    detailsAr: "تصميم ثوري يجمع بين ستارتين مختلفتين في نظام واحد، مما يسمح بالانتقال السلس بين أناقة النهار الشفافة وخصوصية الليل.",
    detailsEn: "A revolutionary design combining two distinct blinds in a single system, allowing seamless transition between sheer daytime elegance and nighttime privacy.",
    alt: "Double System Blinds",
    category: "Modern",
    is_active: true,
    colors: []
  },
  {
    id: "printed",
    labelAr: "ستائر رول مطبوعة",
    labelEn: "Printed Roller Blinds",
    price: 1550,
    images: ["/photos for crystal/printed_roller.png"],
    descAr: "تصاميم ونقوش مخصصة",
    descEn: "Custom Designs & Patterns",
    detailsAr: "أضف لمسة شخصية لمساحتك مع ستائر الرول المطبوعة الفاخرة، تتميز بنقوش مخصصة عالية الجودة وطباعة مقاومة للأشعة فوق البنفسجية.",
    detailsEn: "Add a personalized touch to your space with our premium printed roller blinds, featuring high-quality customized patterns and UV-resistant prints.",
    alt: "Printed Roller Blinds",
    category: "Printed",
    is_active: true,
    colors: []
  },
  {
    id: "hospital",
    labelAr: "ستائر بين أسرة",
    labelEn: "Bed Dividing Curtains",
    price: 1200,
    images: ["/photos for crystal/hospital_curtain.png"],
    descAr: "حلول احترافية للخصوصية",
    descEn: "Professional Privacy Solutions",
    detailsAr: "ستائر فواصل احترافية للمستشفيات والعيادات. مصممة لتوفير أقصى درجات الخصوصية، سهولة الصيانة، وحركة سلسة على المجرى.",
    detailsEn: "Professional-grade dividing curtains for hospitals and clinics. Designed for ultimate privacy, easy maintenance, and smooth track operation.",
    alt: "Bed Dividing Curtains",
    category: "Medical",
    is_active: true,
    colors: []
  }
];

interface CurtainCalculatorProps {
  isAr: boolean;
  products?: Product[];
}

export default function CurtainCalculator({ isAr, products = [] }: CurtainCalculatorProps) {
  const activeProducts = products && products.length > 0 ? products.filter(p => p.is_active) : DEFAULT_PRODUCTS;

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(250);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (activeProducts.length > 0) {
      if (!selectedProductId || !activeProducts.some(p => p.id === selectedProductId)) {
        setSelectedProductId(activeProducts[0].id);
      }
    }
  }, [activeProducts, selectedProductId]);

  const activeProduct = activeProducts.find((p) => p.id === selectedProductId) || activeProducts[0];

  useEffect(() => {
    if (!activeProduct) return;
    const calcWidth = Math.max(width, 100) / 100;
    const calcHeight = Math.max(height, 100) / 100;
    const area = calcWidth * calcHeight;
    const price = Math.round(activeProduct.price * area);
    setEstimatedPrice(price);
  }, [activeProduct, width, height]);

  const handleWidthChange = (val: number) => {
    setWidth(Math.max(0, val));
  };

  const handleHeightChange = (val: number) => {
    setHeight(Math.max(0, val));
  };

  const handleAddToCart = () => {
    if (!activeProduct) return;
    addToCart({
      id: `${activeProduct.id}_${width}_${height}_${Date.now()}`,
      productId: activeProduct.id,
      labelEn: activeProduct.labelEn,
      labelAr: activeProduct.labelAr,
      image: activeProduct.images[0] || "",
      price: estimatedPrice,
      quantity: 1,
      width,
      height,
    });
  };

  if (!activeProduct) return null;

  return (
    <section id="calculator" className="py-16 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#3E2723]">
            {isAr ? "احسب السعر التقديري" : "Estimate Price Calculator"}
          </h2>
          <p className="text-sm text-[#3E2723]/70 mt-2">
            {isAr ? "احصل على سعر تقريبي لستائرك في ثوانِ" : "Get an approximate price for your blinds in seconds"}
          </p>
        </div>

        {/* Brown Container Box */}
        <div className="bg-[#2B1B17] rounded-[2rem] p-6 md:p-10 shadow-lg relative">
          {/* Background decorative circles wrapped to prevent clipping children */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" style={{ direction: isAr ? "rtl" : "ltr" }}>
            
            {/* Inputs Block (col-span-8) */}
            <div className="lg:col-span-8 w-full">
              <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10 shadow-md">
                
                {/* 1. Curtain Type Dropdown */}
                <div className="w-full md:w-[40%] relative z-30">
                  <label className="text-[11px] font-bold text-[#3E2723]/60 mb-1.5 block text-start">
                    {isAr ? "نوع الستارة" : "Curtain Type"}
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex items-center justify-between bg-[#FDFBF7] border border-[#3E2723]/15 rounded-xl px-3 py-2.5 text-xs font-bold text-[#3E2723] focus:outline-none focus:border-[#d4af37]"
                    >
                      <span>{isAr ? activeProduct.labelAr : activeProduct.labelEn}</span>
                      <span className="material-symbols-outlined text-sm text-[#3E2723]/50">
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#3E2723]/15 rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto py-1">
                          {activeProducts.map((prod) => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(prod.id);
                                setIsOpen(false);
                              }}
                              className={`w-full px-3 py-2 hover:bg-[#3E2723]/5 text-start text-xs font-semibold block ${
                                prod.id === selectedProductId ? "text-[#d4af37] bg-[#3E2723]/5" : "text-[#3E2723]"
                              }`}
                            >
                              {isAr ? prod.labelAr : prod.labelEn}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Vertical Divider on Desktop */}
                <div className="hidden md:block w-[1px] h-10 bg-[#3E2723]/10" />

                {/* 2. Width (cm) Stepper */}
                <div className="w-full md:w-[30%]">
                  <label className="text-[11px] font-bold text-[#3E2723]/60 mb-1.5 block text-start">
                    {isAr ? "العرض (سم)" : "Width (cm)"}
                  </label>
                  <div className="flex items-center justify-between bg-[#FDFBF7] border border-[#3E2723]/15 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => handleWidthChange(width - 10)}
                      className="w-8 h-8 rounded-lg text-sm bg-transparent hover:bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="w-14 text-center text-xs font-bold text-[#3E2723] bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleWidthChange(width + 10)}
                      className="w-8 h-8 rounded-lg text-sm bg-transparent hover:bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Vertical Divider on Desktop */}
                <div className="hidden md:block w-[1px] h-10 bg-[#3E2723]/10" />

                {/* 3. Height (cm) Stepper */}
                <div className="w-full md:w-[30%]">
                  <label className="text-[11px] font-bold text-[#3E2723]/60 mb-1.5 block text-start">
                    {isAr ? "الارتفاع (سم)" : "Height (cm)"}
                  </label>
                  <div className="flex items-center justify-between bg-[#FDFBF7] border border-[#3E2723]/15 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => handleHeightChange(height - 10)}
                      className="w-8 h-8 rounded-lg text-sm bg-transparent hover:bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="w-14 text-center text-xs font-bold text-[#3E2723] bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleHeightChange(height + 10)}
                      className="w-8 h-8 rounded-lg text-sm bg-transparent hover:bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Result Block (col-span-4) */}
            <div className="lg:col-span-4 w-full flex flex-col items-center">
              {/* Gold bordered card */}
              <div className="w-full border border-[#d4af37]/45 rounded-2xl p-5 bg-[#201310]/40 flex items-center justify-between shadow-inner">
                <div className="flex flex-col items-start text-start">
                  <span className="text-[#d4af37]/80 text-[10px] uppercase font-bold tracking-wider mb-1">
                    {isAr ? "السعر التقديري" : "Estimated Price"}
                  </span>
                  <span className="text-3xl font-extrabold text-[#d4af37] tracking-tight">
                    {estimatedPrice.toLocaleString(isAr ? "ar-EG" : "en-US")}
                  </span>
                  <span className="text-[#d4af37] text-[10px] font-bold mt-1">
                    {isAr ? "جنيه مصري" : "EGP"}
                  </span>
                </div>
                {/* Gold Calculator Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                  <span className="material-symbols-outlined text-2xl">calculate</span>
                </div>
              </div>

              {/* Disclaimer */}
              <span className="text-[#d4af37]/80 text-[9px] font-light mt-3 block text-center">
                {isAr
                  ? "* السعر تقريبي وقد يختلف بعد المعاينة"
                  : "* Price is estimate only and may vary after measurement"}
              </span>
            </div>

          </div>

          {/* CTA Buttons at the bottom */}
          <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-[#2B1B17] hover:bg-[#d4af37] border border-[#d4af37] text-white px-8 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
              {isAr ? "أضف إلى السلة" : "Add to Cart"}
            </button>
            <a
              href="#reserve"
              className="bg-[#d4af37] hover:bg-white text-[#2B1B17] px-8 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isAr ? "احجز موعد للمعاينة مجاناً" : "Book Free Measurement"}
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
