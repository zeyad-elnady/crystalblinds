"use client";

import { useState } from "react";

interface Testimonial {
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  textAr: string;
  textEn: string;
  stars: number;
  avatar: string;
}

export default function Testimonials({ isAr }: { isAr: boolean }) {
  const testimonials: Testimonial[] = [
    {
      nameAr: "سارة إبراهيم",
      nameEn: "Sara Ibrahim",
      locationAr: "القاهرة",
      locationEn: "Cairo",
      textAr: "الستائر خيال.. شكل الشقة بالكامل اتغير للأفضل. شكراً جداً لفريق كريستال على المعاملة الراقية والالتزام التام بالمواعيد وجودة الخامات والتركيب الاحترافي بالملي.",
      textEn: "The blinds are stunning! The entire apartment's aesthetic has completely changed. Thanks to the Crystal team for their premium service, strict adherence to timelines, and perfect installation.",
      stars: 5,
      avatar: "س",
    },
    {
      nameAr: "أحمد محمود",
      nameEn: "Ahmed Mahmoud",
      locationAr: "الجيزة",
      locationEn: "Giza",
      textAr: "تعامل راقي جداً من أول المعاينة والمهندس اللي شرفني وساعدني اختار الخامات المناسبة لحد التركيب. التزام تام بالوقت وجودة لا يعلى عليها. أنصح بالتعامل معهم وبشدة.",
      textEn: "Super professional experience from the initial measurement visit where the engineer helped me choose the right fabrics, to the final installation. Unmatched quality and timing. Highly recommended.",
      stars: 5,
      avatar: "أ",
    },
    {
      nameAr: "محمد علي",
      nameEn: "Mohamed Ali",
      locationAr: "القاهرة",
      locationEn: "Cairo",
      textAr: "الخامات ممتازة ومطابقة للمواصفات تماماً، والتركيب تم بدقة متناهية وسرعة بدون أي فوضى. فخور بالتعامل معكم وشكراً جزيلاً لفريق كريستال على هذا المستوى العالمي.",
      textEn: "The fabrics are top-tier and perfectly match specifications. The installation was incredibly precise and clean. Proud to deal with you, and many thanks to the Crystal team for this world-class level.",
      stars: 5,
      avatar: "م",
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "آراء عملائنا" : "TESTIMONIALS"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "ماذا يقول عملائنا عنا؟" : "What Our Clients Say"}
          </h2>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="group flex flex-col justify-between bg-[#FFFDFA]/60 border border-white/50 rounded-[2rem] p-8 hover:bg-[#FFFDFA]/80 hover:shadow-xl transition-all duration-500 hover:border-[#d4af37]/30 backdrop-blur-md relative shadow-[0_10px_30px_rgba(38,23,12,0.03)]"
            >
              {/* Star Rating */}
              <div className={`flex gap-1 mb-6 ${isAr ? "flex-row-reverse" : ""}`}>
                {[...Array(item.stars)].map((_, s) => (
                  <span key={s} className="material-symbols-outlined text-[#d4af37] text-lg select-none">
                    star
                  </span>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className={`text-base font-light leading-relaxed text-[#3E2723]/80 mb-8 flex-1 ${isAr ? "text-right" : "text-left"}`}>
                {isAr ? item.textAr : item.textEn}
              </p>

              {/* User Info */}
              <div className={`flex items-center gap-4 border-t border-[#3E2723]/10 pt-6 mt-auto ${isAr ? "flex-row-reverse text-right" : "text-left"}`}>
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10 flex items-center justify-center text-[#d4af37] font-bold text-lg shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#3E2723] group-hover:text-[#d4af37] transition-colors">
                    {isAr ? item.nameAr : item.nameEn}
                  </h4>
                  <p className="text-xs text-[#3E2723]/55 mt-0.5">
                    {isAr ? item.locationAr : item.locationEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
