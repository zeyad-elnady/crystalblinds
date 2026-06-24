"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/products";

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
  // Use DB products if available, fallback to default list
  const activeProducts = products && products.length > 0 ? products.filter(p => p.is_active) : DEFAULT_PRODUCTS;

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(250);
  const [pieces, setPieces] = useState<number>(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sync selectedProductId with incoming products list
  useEffect(() => {
    if (activeProducts.length > 0) {
      // If currently selected product is not in the list, set to first one
      if (!selectedProductId || !activeProducts.some(p => p.id === selectedProductId)) {
        setSelectedProductId(activeProducts[0].id);
      }
    }
  }, [activeProducts, selectedProductId]);

  const activeProduct = activeProducts.find((p) => p.id === selectedProductId) || activeProducts[0];

  useEffect(() => {
    if (!activeProduct) return;

    // Calculate area in square meters (minimum width and height usually 100cm/1m for calculation purposes)
    const calcWidth = Math.max(width, 100) / 100;
    const calcHeight = Math.max(height, 100) / 100;
    const area = calcWidth * calcHeight;
    const price = Math.round(activeProduct.price * area * pieces);

    setEstimatedPrice(price);
  }, [activeProduct, width, height, pieces]);

  const handleWidthChange = (val: number) => {
    setWidth(Math.max(0, val));
  };

  const handleHeightChange = (val: number) => {
    setHeight(Math.max(0, val));
  };

  if (!activeProduct) return null;

  return (
    <section id="calculator" className="py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723] relative overflow-hidden">
      {/* Decorative premium blurs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#3E2723]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "احسب تكلفتك" : "PRICING ESTIMATION"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "احسب السعر التقديري" : "Curtain Price Calculator"}
          </h2>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Main Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Product Showcase Slide (col-span-5) */}
          <div className="lg:col-span-5 relative rounded-[2.5rem] overflow-hidden min-h-[450px] lg:min-h-full flex flex-col justify-end p-8 sm:p-10 shadow-2xl border border-[#d4af37]/10 group">
            
            {/* Background Images Crossfade */}
            {activeProducts.map((prod) => {
              const isSelected = prod.id === selectedProductId;
              return (
                <div
                  key={prod.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  <img
                    src={prod.images[0] || "/placeholder.jpg"}
                    alt={isAr ? prod.labelAr : prod.labelEn}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}

            {/* Dark elegant overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1C18] via-[#3E2723]/40 to-transparent z-10" />

            {/* Showcase details overlay */}
            <div className="relative z-20 text-white flex flex-col justify-end h-full mt-32">
              <span className="inline-block bg-[#d4af37] text-[#3E2723] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 self-start">
                {activeProduct.category}
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-white mb-2 transition-all duration-500">
                {isAr ? activeProduct.labelAr : activeProduct.labelEn}
              </h3>
              <p className="text-[#FFFDFA]/80 text-sm font-light leading-relaxed mb-4 transition-all duration-500">
                {isAr ? activeProduct.descAr : activeProduct.descEn}
              </p>
              
              {activeProduct.detailsAr && (
                <p className="text-white/60 text-xs font-light leading-relaxed border-t border-white/10 pt-4 mb-4 transition-all duration-500">
                  {isAr ? activeProduct.detailsAr : activeProduct.detailsEn}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] bg-[#3E2723]/30 backdrop-blur-sm self-start px-3 py-1.5 rounded-lg border border-[#d4af37]/20">
                <span className="material-symbols-outlined text-base">sell</span>
                <span>
                  {isAr
                    ? `يبدأ من ${activeProduct.price.toLocaleString("ar-EG")} ج.م للمتر المربع`
                    : `Starts from ${activeProduct.price.toLocaleString("en-US")} EGP / m²`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Configurator Panel (col-span-7) */}
          <div className="lg:col-span-7 bg-white border border-[#3E2723]/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(62,39,35,0.03)] flex flex-col justify-between gap-8">
            
            {/* Header info */}
            <div>
              <h3 className="text-xl font-bold text-[#3E2723] font-headline mb-1">
                {isAr ? "قم بتخصيص ستارتك" : "Customize Your Blind"}
              </h3>
              <p className="text-xs text-[#3E2723]/60">
                {isAr ? "حدد المقاسات والكمية المطلوبة لحساب السعر التقديري" : "Specify dimensions and quantity to estimate the price"}
              </p>
            </div>

            {/* Premium Visual Selection Dropdown */}
            <div className="flex flex-col gap-3 relative z-30">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3E2723]/80">
                {isAr ? "نوع الستارة *" : "Curtain Type *"}
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex items-center justify-between bg-[#FFFDFA] border border-[#3E2723]/25 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#d4af37] transition-all text-sm font-semibold text-[#3E2723]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#3E2723]/10 bg-white">
                      <img src={activeProduct.images[0] || "/placeholder.jpg"} alt={isAr ? activeProduct.labelAr : activeProduct.labelEn} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-start text-start">
                      <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-bold">
                        {activeProduct.category}
                      </span>
                      <span className="text-xs font-extrabold text-[#3E2723] mt-0.5">
                        {isAr ? activeProduct.labelAr : activeProduct.labelEn}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#3E2723]/60 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                </button>

                {isOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    
                    {/* Dropdown panel */}
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-[#3E2723]/15 rounded-2xl shadow-xl z-50 max-h-[300px] overflow-y-auto py-2">
                      {activeProducts.map((prod) => {
                        const isSelected = prod.id === selectedProductId;
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3E2723]/5 transition-colors text-start ${
                              isSelected ? "bg-[#3E2723]/5 text-[#d4af37]" : "text-[#3E2723]"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#3E2723]/10 bg-white">
                              <img src={prod.images[0] || "/placeholder.jpg"} alt={isAr ? prod.labelAr : prod.labelEn} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col items-start text-start">
                              <span className={`text-[9px] uppercase tracking-wider font-bold ${isSelected ? "text-[#d4af37]" : "text-[#3E2723]/50"}`}>
                                {prod.category}
                              </span>
                              <span className="text-xs font-bold mt-0.5">
                                {isAr ? prod.labelAr : prod.labelEn}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dimension Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Width Input */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#3E2723]/10 bg-[#FFFDFA]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3E2723]/80">
                  {isAr ? "العرض (سم) *" : "Width (cm) *"}
                </label>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleWidthChange(width - 10)}
                    className="w-10 h-10 rounded-xl bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-center text-lg font-extrabold text-[#3E2723] focus:outline-none border-b-2 border-transparent focus:border-[#d4af37] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleWidthChange(width + 10)}
                    className="w-10 h-10 rounded-xl bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/10"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-center text-[#3E2723]/40 font-light">
                  {isAr ? "الحد الأدنى للحساب: 100 سم" : "Min calculation width: 100cm"}
                </span>
              </div>

              {/* Height Input */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#3E2723]/10 bg-[#FFFDFA]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3E2723]/80">
                  {isAr ? "الارتفاع (سم) *" : "Height (cm) *"}
                </label>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleHeightChange(height - 10)}
                    className="w-10 h-10 rounded-xl bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-center text-lg font-extrabold text-[#3E2723] focus:outline-none border-b-2 border-transparent focus:border-[#d4af37] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleHeightChange(height + 10)}
                    className="w-10 h-10 rounded-xl bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/10"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-center text-[#3E2723]/40 font-light">
                  {isAr ? "الحد الأدنى للحساب: 100 سم" : "Min calculation height: 100cm"}
                </span>
              </div>
            </div>

            {/* Pieces Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#3E2723]/5 pt-6">
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-[#3E2723]/80">
                  {isAr ? "عدد القطع *" : "Number of Pieces *"}
                </label>
                <span className="text-[10px] text-[#3E2723]/50 font-light mt-0.5">
                  {isAr ? "العدد الإجمالي للمقاس المحدد" : "Total pieces for this dimension"}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-4 bg-[#FFFDFA] border border-[#3E2723]/15 rounded-xl p-1.5 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setPieces(Math.max(1, pieces - 1))}
                  className="w-10 h-10 rounded-lg bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/5"
                >
                  -
                </button>
                <span className="text-base font-extrabold w-12 text-center text-[#3E2723]">
                  {pieces}
                </span>
                <button
                  type="button"
                  onClick={() => setPieces(pieces + 1)}
                  className="w-10 h-10 rounded-lg bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg border border-[#3E2723]/5"
                >
                  +
                </button>
              </div>
            </div>

            {/* Result Estimated Card */}
            <div className="bg-[#3E2723] bg-gradient-to-r from-[#3E2723] to-[#2E1C18] border border-[#d4af37]/20 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-wider mb-1 block">
                  {isAr ? "السعر التقديري الإجمالي" : "ESTIMATED TOTAL PRICE"}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#d4af37] tracking-tight">
                    {estimatedPrice.toLocaleString(isAr ? "ar-EG" : "en-US")}
                  </span>
                  <span className="text-sm font-light text-white/80 ml-1">
                    {isAr ? "ج.م" : "EGP"}
                  </span>
                </div>
                <span className="text-[9px] text-white/40 font-light mt-2 max-w-[250px] leading-relaxed block">
                  {isAr
                    ? "* التسعير تقريبي، وقد يختلف بعد المعاينة الفعلية."
                    : "* Estimate only. Final price details verified during inspection."}
                </span>
              </div>

              <a
                href="#reserve"
                className="w-full md:w-auto px-6 py-4 bg-[#d4af37] text-[#3E2723] hover:bg-white hover:text-[#3E2723] rounded-2xl font-bold text-xs uppercase tracking-wider text-center transition-all duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm font-bold">calendar_month</span>
                {isAr ? "حجز موعد للمعاينة مجاناً" : "Book Free Measurement"}
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
