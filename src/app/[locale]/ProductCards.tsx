"use client";

import { useState } from "react";

interface Product {
  id: string;
  images: string[];
  alt: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  detailsEn: string;
  detailsAr: string;
  category: string;
  price: number;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    images: [
      "/photos for crystal/ستائر رول بلاك أوت.jpeg",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/3.jpeg",
    ],
    alt: "Blackout Roller Blinds",
    labelEn: "Blackout Roller Blinds",
    labelAr: "ستائر رول بلاك أوت",
    descEn: "Absolute Light & Heat Insulation",
    descAr: "عزل مطلق للضوء والحرارة",
    detailsEn: "Crafted to completely block out sunlight and UV rays, ensuring maximum privacy and a restful environment anytime.",
    detailsAr: "مصممة لحجب أشعة الشمس والأشعة فوق البنفسجية بالكامل، مما يضمن أقصى درجات الخصوصية وبيئة مريحة في أي وقت.",
    category: "Roller",
    price: 1450,
  },
  {
    id: "2",
    images: [
      "/photos for crystal/ستائر رول صن سكرين.jpeg",
      "/photos for crystal/2.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Sunscreen Roller Blinds",
    labelEn: "Sunscreen Roller Blinds",
    labelAr: "ستائر رول صن سكرين",
    descEn: "Smart Protection & Natural Light",
    descAr: "حماية ذكية وإضاءة طبيعية",
    detailsEn: "Allows you to maintain your view while reducing glare and heat, perfect for living spaces that need natural lighting.",
    detailsAr: "تسمح لك بالحفاظ على الرؤية مع تقليل الوهج والحرارة، مثالية لمساحات المعيشة التي تحتاج إلى إضاءة طبيعية.",
    category: "Roller",
    price: 1300,
  },
  {
    id: "3",
    images: [
      "/photos for crystal/ستائر شرائح راسيه.jpeg",
      "/photos for crystal/3.jpeg",
      "/photos for crystal/1.jpeg",
    ],
    alt: "Vertical Blinds",
    labelEn: "Vertical Blinds",
    labelAr: "ستائر شرائح رأسية",
    descEn: "Flexible Control for Wide Spaces",
    descAr: "تحكم مرن للمساحات الواسعة",
    detailsEn: "Ideal for large windows and sliding doors, offering excellent light control and a sleek, contemporary appearance.",
    detailsAr: "مثالية للنوافذ الكبيرة والأبواب المنزلقة، توفر تحكماً ممتازاً في الإضاءة ومظهراً عصرياً وأنيقاً.",
    category: "Classic",
    price: 1100,
  },
  {
    id: "4",
    images: [
      "/photos for crystal/ستائر زيبرا.jpeg",
      "/photos for crystal/4.jpeg",
      "/photos for crystal/2.jpeg",
    ],
    alt: "Zebra Blinds",
    labelEn: "Zebra Blinds",
    labelAr: "ستائر زيبرا",
    descEn: "Modern Graduated Design",
    descAr: "تصميم عصري متدرج",
    detailsEn: "Features alternating sheer and solid fabric bands, giving you flexible control over light filtering and privacy in one brilliant design.",
    detailsAr: "تتميز بأشرطة قماشية شفافة وصلبة متناوبة، مما يمنحك تحكماً مرناً في ترشيح الضوء والخصوصية في تصميم واحد رائع.",
    category: "Modern",
    price: 1650,
  },
  {
    id: "5",
    images: [
      "/photos for crystal/ستائر شرائح معدنية.jpeg",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Metallic Blinds",
    labelEn: "Metallic/Wooden Blinds",
    labelAr: "ستائر شرائح معدنية/خشبية",
    descEn: "Durability & Luxury for Every Taste",
    descAr: "متانة وفخامة لكل ذوق",
    detailsEn: "Engineered for longevity and style, these blinds offer a timeless look with effortless adjustability for any modern interior.",
    detailsAr: "مصممة لتدوم وتتميز بالأناقة، تقدم هذه الستائر مظهراً خالداً مع إمكانية تعديل سهلة لأي تصميم داخلي حديث.",
    category: "Classic",
    price: 1850,
  },
  {
    id: "6",
    images: [
      "/photos for crystal/ستائر دبل سيستم.jpeg",
      "/photos for crystal/3.jpeg",
      "/photos for crystal/2.jpeg",
    ],
    alt: "Double System Blinds",
    labelEn: "Double System Blinds",
    labelAr: "ستائر دبل سيستم",
    descEn: "Dual Intelligence & Unlimited Possibilities",
    descAr: "ذكاء مزدوج وإمكانيات غير محدودة",
    detailsEn: "A revolutionary design combining two distinct blinds in a single system, allowing seamless transition between sheer daytime elegance and nighttime privacy.",
    detailsAr: "تصميم ثوري يجمع بين ستارتين مختلفتين في نظام واحد، مما يسمح بالانتقال السلس بين أناقة النهار الشفافة وخصوصية الليل.",
    category: "Modern",
    price: 2100,
  },
  {
    id: "7",
    images: [
      "/photos for crystal/printed_roller.png",
      "/photos for crystal/2.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Printed Roller Blinds",
    labelEn: "Printed Roller Blinds",
    labelAr: "ستائر رول مطبوعه",
    descEn: "Custom Designs & Patterns",
    descAr: "تصاميم ونقوش مخصصة",
    detailsEn: "Add a personalized touch to your space with our premium printed roller blinds, featuring high-quality customized patterns and UV-resistant prints.",
    detailsAr: "أضف لمسة شخصية لمساحتك مع ستائر الرول المطبوعة الفاخرة، تتميز بنقوش مخصصة عالية الجودة وطباعة مقاومة للأشعة فوق البنفسجية.",
    category: "Printed",
    price: 1550,
  },
  {
    id: "8",
    images: [
      "/photos for crystal/hospital_curtain.png",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/3.jpeg",
    ],
    alt: "Bed Dividing Curtains",
    labelEn: "Bed Dividing Curtains",
    labelAr: "ستائر بين اسره",
    descEn: "Professional Privacy Solutions",
    descAr: "حلول احترافية للخصوصية",
    detailsEn: "Professional-grade dividing curtains for hospitals and clinics. Designed for ultimate privacy, easy maintenance, and smooth track operation.",
    detailsAr: "ستائر فواصل احترافية للمستشفيات والعيادات. مصممة لتوفير أقصى درجات الخصوصية، سهولة الصيانة، وحركة سلسة على المجرى.",
    category: "Medical",
    price: 1200,
  },
];

const CATEGORIES = [
  { id: "All", labelEn: "All", labelAr: "الكل" },
  { id: "Roller", labelEn: "Roller", labelAr: "رول" },
  { id: "Printed", labelEn: "Printed", labelAr: "مطبوعه" },
  { id: "Modern", labelEn: "Modern", labelAr: "عصري" },
  { id: "Classic", labelEn: "Classic", labelAr: "كلاسيك" },
  { id: "Medical", labelEn: "Dividers", labelAr: "بين اسره" },
];

function ProductCardItem({
  product,
  isExpanded,
  onToggleExpand,
  isAr
}: {
  product: Product;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isAr: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="group flex flex-col bg-white/60 border border-white/50 rounded-xl overflow-hidden hover:bg-white/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] backdrop-blur-md">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0 group/image">
        <img
          src={product.images[currentImageIndex]}
          alt={`${product.alt} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Carousel Controls */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 hover:bg-black/40 transition-all duration-300"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 hover:bg-black/40 transition-all duration-300"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
              {product.images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === currentImageIndex ? 'w-4 bg-[#d4af37]' : 'w-1.5 bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-6 ${isAr ? "items-end" : "items-start"}`}>
        <div className={`w-full flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-semibold">
            {isAr ? "الأقمشة الفاخرة" : "Artisan Fabrics"}
          </span>
          {/* Price */}
          <span className="text-[#26170c] font-bold text-sm bg-white/50 px-2.5 py-1 rounded shadow-sm border border-white/60">
            {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
          </span>
        </div>

        <h4 className="font-headline text-xl text-[#26170c] font-bold mb-3">
          {isAr ? product.labelAr : product.labelEn}
        </h4>
        <p className="text-[#26170c]/70 text-sm leading-relaxed mb-4 flex-1">
          {isAr ? product.descAr : product.descEn}
        </p>

        {/* Expandable Details Section */}
        <div
          className={`grid transition-all duration-500 ease-in-out w-full ${isExpanded ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"}`}
        >
          <div className="overflow-hidden flex flex-col gap-4">
            <p className="text-[#26170c]/60 text-sm leading-relaxed border-t border-[#26170c]/10 pt-4">
              {isAr ? product.detailsAr : product.detailsEn}
            </p>
            <a
              href="#consult"
              className={`inline-block text-center px-6 py-2.5 border border-[#26170c] text-[#26170c] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#26170c] hover:text-[#faf8f5] transition-colors self-start ${isAr ? "self-end" : "self-start"}`}
            >
              {isAr ? "احجز زيارة" : "Book a Visit"}
            </a>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-wider hover:opacity-70 transition-opacity mt-auto"
        >
          <span>
            {isExpanded
              ? (isAr ? "إخفاء التفاصيل" : "Show Less")
              : (isAr ? "اكتشف المزيد" : "Explore More")}
          </span>
          <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isExpanded ? "rotate-[-90deg]" : (isAr ? "rotate-180" : "rotate-0")}`}>
            {isExpanded ? "expand_less" : "arrow_forward"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ProductCards({ isAr }: { isAr: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProducts = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="w-full flex flex-col items-center px-6 md:px-12 pb-16 pt-8">
      {/* Filter Tabs */}
      <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12 ${isAr ? "flex-row-reverse" : ""}`}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setExpandedId(null);
            }}
            className={`
              px-6 py-2.5 rounded-full text-sm tracking-wider font-semibold transition-all duration-300
              border
              ${activeCategory === cat.id
                ? "bg-[#26170c] border-[#26170c] text-[#faf8f5]"
                : "bg-white/50 border-[#26170c]/20 text-[#26170c]/70 hover:border-[#d4af37] hover:text-[#d4af37]"
              }
            `}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl items-start ${isAr ? "rtl text-right" : "ltr text-left"}`}>
        {filteredProducts.map((product) => (
          <ProductCardItem
            key={product.id}
            product={product}
            isExpanded={expandedId === product.id}
            onToggleExpand={() => setExpandedId(expandedId === product.id ? null : product.id)}
            isAr={isAr}
          />
        ))}
      </div>
    </div>
  );
}
