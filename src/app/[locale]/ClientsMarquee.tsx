"use client";

import React from "react";

import { Partner } from "@/lib/partners";

const DEFAULT_CLIENTS: Partner[] = [
  { id: "1", nameAr: "جوتكس", nameEn: "Gotex", src: "/out clients/Gotex_logo.png", sort_order: 10 },
  { id: "2", nameAr: "المطار", nameEn: "Almatar", src: "/out clients/almatar_logo_page.png", sort_order: 20 },
  { id: "3", nameAr: "ارابكوميد", nameEn: "Arabcomed", src: "/out clients/arabcomed logo.png", sort_order: 30 },
  { id: "4", nameAr: "بوخارست", nameEn: "Bucharest", src: "/out clients/bo5arest logo.png", sort_order: 40 },
  { id: "5", nameAr: "جانا فوم", nameEn: "Jana Foam", src: "/out clients/jana_foam_logo.png", sort_order: 50 },
  { id: "6", nameAr: "ماركون", nameEn: "Markoon", src: "/out clients/markoon logo.png", sort_order: 60 },
  { id: "7", nameAr: "مزايا", nameEn: "Mazaya", src: "/out clients/mazaya logo.png", sort_order: 70 },
  { id: "8", nameAr: "مؤسسة فاتبع سبباً - طيبة", nameEn: "Tayba Foundation", src: "/out clients/موسسه فاتبع سببا - طيبه logo.png", sort_order: 80 },
];

interface ClientsMarqueeProps {
  isAr: boolean;
  partners?: Partner[];
}

export default function ClientsMarquee({ isAr, partners }: ClientsMarqueeProps) {
  const displayClients = partners && partners.length > 0 ? partners : DEFAULT_CLIENTS;
  return (
    <section className="py-16 md:py-24 bg-[#3E2723] overflow-hidden relative border-y border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-2 block">
          {isAr ? "شركاء النجاح" : "Our Partners"}
        </span>
        <h3 className="font-headline text-3xl md:text-4xl text-[#FFFDFA]">
          {isAr ? "عملاؤنا المتميزون" : "Our Distinguished Clients"}
        </h3>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full flex bg-[#3E2723] py-10" style={{ overflow: "hidden", display: "flex" }} dir="ltr">
        {/* Left/Right fading edges for a premium look */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#3E2723] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#3E2723] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center hover:[animation-play-state:paused]">
          {/* We duplicate the list to make the loop seamless */}
          {[...displayClients, ...displayClients].map((client, i) => {
            const sizeClasses = "w-[140px] md:w-[180px] h-[90px]";

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
                  <span className="text-[#FFFDFA] text-[10px] md:text-xs font-semibold tracking-wide">
                    {client.nameAr}
                  </span>
                  <span className="text-[#FFFDFA]/60 text-[9px] md:text-[10px] font-medium tracking-widest uppercase mt-0.5">
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
