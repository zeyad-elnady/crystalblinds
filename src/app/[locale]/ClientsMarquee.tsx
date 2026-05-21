"use client";

import React from "react";

const CLIENTS = [
  { nameAr: "جوتكس", nameEn: "Gotex", src: "/out clients/Gotex_logo.png" },
  { nameAr: "المطار", nameEn: "Almatar", src: "/out clients/almatar_logo_page.png" },
  { nameAr: "ارابكوميد", nameEn: "Arabcomed", src: "/out clients/arabcomed logo.png" },
  { nameAr: "بوخارست", nameEn: "Bucharest", src: "/out clients/bo5arest logo.png" },
  { nameAr: "جانا فوم", nameEn: "Jana Foam", src: "/out clients/jana_foam_logo.png" },
  { nameAr: "ماركون", nameEn: "Markoon", src: "/out clients/markoon logo.png" },
  { nameAr: "مزايا", nameEn: "Mazaya", src: "/out clients/mazaya logo.png" },
  { nameAr: "مؤسسة فاتبع سبباً - طيبة", nameEn: "Tayba Foundation", src: "/out clients/موسسه فاتبع سببا - طيبه logo.png" },
];

export default function ClientsMarquee({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-16 md:py-24 bg-[#6A311D] overflow-hidden relative border-y border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-2 block">
          {isAr ? "شركاء النجاح" : "Our Partners"}
        </span>
        <h3 className="font-headline text-3xl md:text-4xl text-[#faf8f5]">
          {isAr ? "عملاؤنا المتميزون" : "Our Distinguished Clients"}
        </h3>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full flex bg-[#6A311D] py-10" style={{ overflow: "hidden", display: "flex" }} dir="ltr">
        {/* Left/Right fading edges for a premium look */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#6A311D] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#6A311D] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center hover:[animation-play-state:paused]">
          {/* We duplicate the list to make the loop seamless */}
          {[...CLIENTS, ...CLIENTS].map((client, i) => {
            const isMarkoon = client.nameEn === "Markoon";
            const isTayba = client.nameEn === "Tayba Foundation";
            
            let sizeClasses = "w-[120px] md:w-[160px] h-[80px]";
            if (isTayba) {
              sizeClasses = "w-[200px] md:w-[300px] h-[140px]";
            } else if (isMarkoon) {
              sizeClasses = "w-[160px] md:w-[220px] h-[100px]";
            }

            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center mx-6 md:mx-10 group"
              >
                <div
                  tabIndex={0}
                  className={`flex shrink-0 items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer outline-none ${sizeClasses}`}
                >
                  <img
                    src={client.src}
                    alt={client.nameEn}
                    title={client.nameEn}
                    className="max-w-full max-h-full object-contain transition-all duration-500"
                  />
                </div>
                <div className="mt-4 flex flex-col items-center text-center">
                  <span className="text-[#faf8f5] text-[10px] md:text-xs font-semibold tracking-wide">
                    {client.nameAr}
                  </span>
                  <span className="text-[#faf8f5]/60 text-[9px] md:text-[10px] font-medium tracking-widest uppercase mt-0.5">
                    {client.nameEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
