"use client";

import Link from "next/link";

interface BlindType {
  labelAr: string;
  labelEn: string;
  subAr: string;
  subEn: string;
  image: string;
  link: string;
  icon: string;
}

import { Product } from "@/lib/products";

export default function BlindTypes({ isAr, locale, products }: { isAr: boolean; locale: string; products?: Product[] }) {
  const getIconForProduct = (productId: string, category: string) => {
    const lowerCat = category.toLowerCase();
    if (productId === 'b301c238-1234-4567-8901-abcdef123404' || lowerCat.includes('zebra') || lowerCat.includes('زيبرا')) return 'window';
    if (productId === 'b301c238-1234-4567-8901-abcdef123407' || lowerCat.includes('roller') || lowerCat.includes('رول')) return 'layers';
    if (productId === 'b301c238-1234-4567-8901-abcdef123401' || lowerCat.includes('blackout') || lowerCat.includes('بلاك')) return 'dark_mode';
    if (productId === 'b301c238-1234-4567-8901-abcdef123402' || lowerCat.includes('sunscreen') || lowerCat.includes('صن')) return 'sunny';
    if (productId === 'b301c238-1234-4567-8901-abcdef123406' || lowerCat.includes('motor') || lowerCat.includes('موتور')) return 'settings_remote';
    return 'filter_frames';
  };

  const blindTypes: BlindType[] = products && products.length > 0 
    ? products.map(p => ({
        labelAr: p.labelAr,
        labelEn: p.labelEn,
        subAr: p.descAr,
        subEn: p.descEn,
        image: p.images[0] || "/placeholder.jpg",
        link: p.category ? `/${locale}/products?category=${encodeURIComponent(p.category)}` : `/${locale}/products`,
        icon: getIconForProduct(p.id, p.category)
      }))
    : [
        {
          labelAr: "ستائر زيبرا",
          labelEn: "Zebra Blinds",
          subAr: "تحكم ذكي بالضوء والخصوصية",
          subEn: "Smart light & privacy control",
          image: "/photos for crystal/ستائر زيبرا.jpeg",
          link: `/${locale}/products?category=zebra`,
          icon: "window",
        },
        {
          labelAr: "ستائر رول",
          labelEn: "Roller Blinds",
          subAr: "بساطة وعصرية تناسب كل الغرف",
          subEn: "Simple & modern for all rooms",
          image: "/photos for crystal/printed_roller.png",
          link: `/${locale}/products?category=sunscreen`,
          icon: "layers",
        },
        {
          labelAr: "ستائر بلاك أوت",
          labelEn: "Blackout Blinds",
          subAr: "عزل كامل للضوء والحرارة بنسبة 100%",
          subEn: "100% complete light & heat isolation",
          image: "/photos for crystal/ستائر رول بلاك أوت.jpeg",
          link: `/${locale}/products?category=blackout`,
          icon: "dark_mode",
        },
        {
          labelAr: "ستائر صن سكرين",
          labelEn: "Sun Screen Blinds",
          subAr: "حماية من الشمس مع الحفاظ على الرؤية",
          subEn: "Sun protection while keeping the view",
          image: "/photos for crystal/ستائر رول صن سكرين.jpeg",
          link: `/${locale}/products?category=sunscreen`,
          icon: "sunny",
        },
        {
          labelAr: "ستائر موتورايزد",
          labelEn: "Motorized Blinds",
          subAr: "تحكم تلقائي ذكي بالريموت والموبايل",
          subEn: "Automatic smart remote & app control",
          image: "/photos for crystal/ستائر دبل سيستم.jpeg",
          link: `/${locale}/smart-curtains`,
          icon: "settings_remote",
        },
      ];

  return (
    <section id="blind-types" className="pt-40 lg:pt-32 pb-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[#3E2723]/60 text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "مجموعتنا" : "OUR SELECTION"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "اكتشف أنواع الستائر" : "Discover Blind Types"}
          </h2>
          <div className="w-16 h-[2px] bg-[#3E2723]/15 mx-auto mt-4" />
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {blindTypes.map((item, i) => (
            <Link
              href={item.link}
              key={i}
              className="group relative h-96 rounded-2xl overflow-hidden border border-[#3E2723]/15 hover:border-[#d4af37] transition-all duration-300 flex flex-col justify-end"
            >
              {/* Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt={isAr ? item.labelAr : item.labelEn}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Flat Overlay */}
                <div className="absolute inset-0 bg-black/60 z-10 transition-opacity duration-300" />
              </div>

              {/* Card Content */}
              <div className="relative z-20 p-6 flex flex-col items-center text-center text-white">
                {/* Floating Icon */}
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 group-hover:bg-white group-hover:text-[#3E2723]">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>

                <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-white transition-colors">
                  {isAr ? item.labelAr : item.labelEn}
                </h3>
                <p className="text-white/80 text-xs font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                  {isAr ? item.subAr : item.subEn}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="flex justify-center mt-16">
          <Link
            href={`/${locale}/products`}
            className="px-8 py-3.5 bg-transparent border-2 border-[#3E2723] text-[#3E2723] hover:bg-[#3E2723] hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
          >
            {isAr ? "عرض جميع المنتجات" : "View All Products"}
          </Link>
        </div>
      </div>
    </section>
  );
}
