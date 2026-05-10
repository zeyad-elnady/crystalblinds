"use client";

import React from "react";

const CLIENTS = [
  { name: "Gotex", src: "/out clients/Gotex_logo.png" },
  { name: "Almatar", src: "/out clients/almatar_logo_page.png" },
  { name: "Arabcomed", src: "/out clients/arabcomed logo.png" },
  { name: "Bo5arest", src: "/out clients/bo5arest logo.png" },
  { name: "Jana Foam", src: "/out clients/jana_foam_logo.png" },
  { name: "Markoon", src: "/out clients/markoon logo.png" },
  { name: "Mazaya", src: "/out clients/mazaya logo.png" },
  { name: "موسسه فاتبع سببا - طيبه", src: "/out clients/موسسه فاتبع سببا - طيبه logo.png" },
];

export default function ClientsMarquee({ isAr }: { isAr: boolean }) {
  return (
    <section className="py-16 md:py-24 bg-[#26170c] overflow-hidden relative border-y border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-2 block">
          {isAr ? "شركاء النجاح" : "Our Partners"}
        </span>
        <h3 className="font-headline text-3xl md:text-4xl text-[#faf8f5]">
          {isAr ? "عملاؤنا المتميزون" : "Our Distinguished Clients"}
        </h3>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full flex bg-[#26170c] py-10" style={{ overflow: "hidden", display: "flex" }} dir="ltr">
        {/* Left/Right fading edges for a premium look */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#26170c] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#26170c] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center hover:[animation-play-state:paused]">
          {/* We duplicate the list to make the loop seamless */}
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <div
              key={i}
              tabIndex={0}
              className="flex shrink-0 items-center justify-center mx-6 md:mx-10 w-[140px] md:w-[200px] h-[90px] bg-white/90 rounded-2xl p-4 grayscale hover:grayscale-0 focus:grayscale-0 active:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100 focus:opacity-100 active:opacity-100 hover:scale-105 cursor-pointer outline-none shadow-lg"
            >
              <img
                src={client.src}
                alt={client.name}
                title={client.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
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
