"use client";

import { useState, useEffect } from "react";

interface Option {
  id: string;
  nameAr: string;
  nameEn: string;
  pricePerSqm: number;
}

export default function CurtainCalculator({ isAr }: { isAr: boolean }) {
  const options: Option[] = [
    { id: "zebra", nameAr: "ستائر زيبرا", nameEn: "Zebra Blinds", pricePerSqm: 950 },
    { id: "blackout", nameAr: "ستائر رول بلاك أوت", nameEn: "Blackout Roller Blinds", pricePerSqm: 850 },
    { id: "sunscreen", nameAr: "ستائر رول صن سكرين", nameEn: "Sunscreen Roller Blinds", pricePerSqm: 900 },
    { id: "vertical", nameAr: "ستائر شرائح رأسية", nameEn: "Vertical Blinds", pricePerSqm: 650 },
    { id: "wooden", nameAr: "ستائر شرائح خشبية", nameEn: "Wooden Blinds", pricePerSqm: 1400 },
  ];

  const [selectedType, setSelectedType] = useState<string>(options[0].id);
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(250);
  const [pieces, setPieces] = useState<number>(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  useEffect(() => {
    const option = options.find((o) => o.id === selectedType);
    if (!option) return;

    // Calculate area in square meters (minimum width and height usually 100cm/1m for calculation purposes)
    const calcWidth = Math.max(width, 100) / 100;
    const calcHeight = Math.max(height, 100) / 100;
    const area = calcWidth * calcHeight;
    const price = Math.round(option.pricePerSqm * area * pieces);

    setEstimatedPrice(price);
  }, [selectedType, width, height, pieces]);

  return (
    <section id="calculator" className="py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "احسب تكلفتك" : "PRICING ESTIMATION"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "احسب السعر التقديري" : "Curtain Price Calculator"}
          </h2>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Calculator Layout */}
        <div className="bg-white border-2 border-[#3E2723]/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(62,39,35,0.04)] overflow-hidden">
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch ${isAr ? "rtl" : "ltr"}`}>
            
            {/* Left Result Card (col-span-5) */}
            <div className="md:col-span-5 bg-[#3E2723] bg-gradient-to-br from-[#3E2723] to-[#2E1C18] border border-[#d4af37]/20 rounded-2xl p-8 text-white flex flex-col justify-between text-center min-h-[250px] shadow-md">
              <div>
                <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em] block mb-3">
                  {isAr ? "السعر التقديري" : "ESTIMATED PRICE"}
                </span>
                <div className="text-4xl md:text-5xl font-extrabold text-[#d4af37] tracking-tight my-4">
                  {estimatedPrice.toLocaleString(isAr ? "ar-EG" : "en-US")}
                  <span className="text-lg font-light text-white ml-2">
                    {isAr ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 text-xs text-white/50 font-light leading-relaxed">
                {isAr
                  ? "* التسعير تقريبي، وقد يختلف بعد الزيارة والمعاينة الفعلية."
                  : "* Price is approximate and might vary after physical measurements."}
              </div>
            </div>

            {/* Right Input Fields (col-span-7) */}
            <div className="md:col-span-7 flex flex-col justify-between gap-6">
              
              {/* Type Select */}
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-semibold text-[#3E2723]/80 ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "نوع الستارة *" : "Curtain Type *"}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full bg-[#FFFDFA] border border-[#3E2723]/25 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#d4af37] transition-all text-sm font-semibold text-[#3E2723] ${
                    isAr ? "text-right" : "text-left"
                  }`}
                >
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {isAr ? opt.nameAr : opt.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensions: Width and Height */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-semibold text-[#3E2723]/80 ${isAr ? "text-right" : "text-left"}`}>
                    {isAr ? "العرض (سم) *" : "Width (cm) *"}
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/25 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-all text-center text-sm font-semibold"
                    placeholder="200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-semibold text-[#3E2723]/80 ${isAr ? "text-right" : "text-left"}`}>
                    {isAr ? "الارتفاع (سم) *" : "Height (cm) *"}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/25 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-all text-center text-sm font-semibold"
                    placeholder="250"
                  />
                </div>
              </div>

              {/* Pieces Counter */}
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-semibold text-[#3E2723]/80 ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "عدد القطع *" : "Number of Pieces *"}
                </label>
                <div className="flex items-center justify-center gap-4 bg-[#FFFDFA] border border-[#3E2723]/25 rounded-xl p-2 max-w-[200px]">
                  <button
                    type="button"
                    onClick={() => setPieces(Math.max(1, pieces - 1))}
                    className="w-10 h-10 rounded-lg bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold w-12 text-center text-[#3E2723]">
                    {pieces}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPieces(pieces + 1)}
                    className="w-10 h-10 rounded-lg bg-[#3E2723]/5 text-[#3E2723] hover:bg-[#d4af37] hover:text-[#3E2723] flex items-center justify-center transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
