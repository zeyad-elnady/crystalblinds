"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Testimonial {
  id: string;
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  textAr: string;
  textEn: string;
  avatar: string;
}

const STORAGE_KEY = "crystal_testimonials";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    nameAr: "سارة إبراهيم",
    nameEn: "Sara Ibrahim",
    locationAr: "القاهرة",
    locationEn: "Cairo",
    textAr: "الستائر خيال.. شكل الشقة بالكامل اتغير للأفضل. شكراً جداً لفريق كريستال على المعاملة الراقية والالتزام التام بالمواعيد وجودة الخامات والتركيب الاحترافي بالملي.",
    textEn: "The blinds are stunning! The entire apartment's aesthetic has completely changed. Thanks to the Crystal team for their premium service, strict adherence to timelines, and perfect installation.",
    avatar: "س",
  },
  {
    id: "2",
    nameAr: "أحمد محمود",
    nameEn: "Ahmed Mahmoud",
    locationAr: "الجيزة",
    locationEn: "Giza",
    textAr: "تعامل راقي جداً من أول المعاينة والمهندس اللي شرفني وساعدني اختار الخامات المناسبة لحد التركيب. التزام تام بالوقت وجودة لا يعلى عليها. أنصح بالتعامل معهم وبشدة.",
    textEn: "Super professional experience from the initial measurement visit where the engineer helped me choose the right fabrics, to the final installation. Unmatched quality and timing. Highly recommended.",
    avatar: "أ",
  },
  {
    id: "3",
    nameAr: "محمد علي",
    nameEn: "Mohamed Ali",
    locationAr: "القاهرة",
    locationEn: "Cairo",
    textAr: "الخامات ممتازة ومطابقة للمواصفات تماماً، والتركيب تم بدقة متناهية وسرعة بدون أي فوضى. فخور بالتعامل معكم وشكراً جزيلاً لفريق كريستال على هذا المستوى العالمي.",
    textEn: "The fabrics are top-tier and perfectly match specifications. The installation was incredibly precise and clean. Proud to deal with you, and many thanks to the Crystal team for this world-class level.",
    avatar: "م",
  },
  {
    id: "4",
    nameAr: "نور الدين حسن",
    nameEn: "Noureddine Hassan",
    locationAr: "الإسكندرية",
    locationEn: "Alexandria",
    textAr: "كنت متردد في البداية لكن بعد المعاينة قررت التعامل معهم وما ندمت أبداً. الستائر جميلة جداً والخدمة رائعة من أول لحظة لآخر لحظة.",
    textEn: "I was hesitant at first, but after the inspection I decided to go with them and I have no regrets. The blinds are beautiful and the service was excellent from start to finish.",
    avatar: "ن",
  },
  {
    id: "5",
    nameAr: "ريم عبد الله",
    nameEn: "Reem Abdullah",
    locationAr: "مدينة نصر",
    locationEn: "Nasr City",
    textAr: "فعلاً تجربة رائعة! الفريق محترف جداً والستائر طلعت أحلى مما توقعت. كريستال بليندز هي الخيار الأول والأخير لي في الستائر.",
    textEn: "A truly wonderful experience! The team is very professional and the blinds turned out more beautiful than I expected. Crystal Blinds is my first and last choice.",
    avatar: "ر",
  },
  {
    id: "6",
    nameAr: "كريم طارق",
    nameEn: "Karim Tarek",
    locationAr: "التجمع الخامس",
    locationEn: "New Cairo",
    textAr: "تعاملت معهم في مشروع كبير لشقتي الجديدة. النتيجة كانت مذهلة والفريق كان متعاوناً جداً في اختيار الألوان والتصاميم. شكراً كريستال بليندز.",
    textEn: "I dealt with them on a large project for my new apartment. The result was amazing and the team was very cooperative in choosing colors and designs. Thank you Crystal Blinds.",
    avatar: "ك",
  },
  {
    id: "7",
    nameAr: "هبة سامي",
    nameEn: "Heba Sami",
    locationAr: "المعادي",
    locationEn: "Maadi",
    textAr: "من أفضل التجارب اللي مررت بيها. دقة في المواعيد، احترافية في العمل، وجودة الخامات تكلم نفسها. ستائر الزيبرا جميلة جداً.",
    textEn: "One of the best experiences I've had. Punctual, professional, and the quality of materials speaks for itself. The Zebra blinds are stunning.",
    avatar: "ه",
  },
  {
    id: "8",
    nameAr: "عمر فاروق",
    nameEn: "Omar Farouk",
    locationAr: "مصر الجديدة",
    locationEn: "Heliopolis",
    textAr: "اتعاملت مع كريستال بليندز وكانت تجربة ممتازة من البداية للنهاية. الستائر الذكية اللي ركبوها غيّرت شكل المكتب كلياً. أنصح بيهم بشدة.",
    textEn: "My experience with Crystal Blinds was excellent from start to finish. The smart blinds they installed completely transformed the office look. Highly recommended.",
    avatar: "ع",
  },
];

export function loadTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return DEFAULT_TESTIMONIALS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TESTIMONIALS;
}

export function saveTestimonials(list: Testimonial[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export type { Testimonial };
export { STORAGE_KEY, DEFAULT_TESTIMONIALS };

export default function Testimonials({ isAr }: { isAr: boolean }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTestimonials(loadTestimonials());
  }, []);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, next]);

  const getPos = (i: number) => {
    const len = testimonials.length;
    const diff = ((i - active) % len + len) % len;
    if (diff === 0) return "center";
    if (diff === 1 || diff === len - 1) return "side";
    return "hidden";
  };

  return (
    <section id="testimonials" className="py-24 bg-[#FFFDFA] text-[#3E2723] overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-14 px-6">
        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
          {isAr ? "آراء عملائنا" : "TESTIMONIALS"}
        </span>
        <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
          {isAr ? "ماذا يقول عملائنا عنا؟" : "What Our Clients Say"}
        </h2>
        <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
      </div>

      {/* Carousel */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 320 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {testimonials.map((item, i) => {
          const pos = getPos(i);
          if (pos === "hidden") return null;
          const isCenter = pos === "center";
          const isLeft = ((i - active + testimonials.length) % testimonials.length) === testimonials.length - 1;

          return (
            <div
              key={item.id}
              onClick={() => !isCenter && (isLeft ? prev() : next())}
              className="absolute transition-all duration-700 ease-in-out cursor-pointer select-none"
              style={{
                width: isCenter ? 520 : 400,
                transform: isCenter
                  ? "translateX(0) scale(1)"
                  : isLeft
                  ? "translateX(-420px) scale(0.85)"
                  : "translateX(420px) scale(0.85)",
                zIndex: isCenter ? 10 : 1,
                filter: isCenter ? "blur(0px)" : "blur(3px)",
                opacity: isCenter ? 1 : 0.45,
              }}
            >
              <div
                className={`bg-white rounded-2xl px-8 py-7 shadow-[0_4px_30px_rgba(62,39,35,0.08)] border ${
                  isCenter ? "border-[#d4af37]/25 shadow-[0_8px_40px_rgba(62,39,35,0.12)]" : "border-[#3E2723]/8"
                }`}
                dir={isAr ? "rtl" : "ltr"}
              >
                {/* Quote mark */}
                <span className="text-5xl leading-none text-[#d4af37]/20 font-serif select-none">"</span>

                {/* Text */}
                <p className={`text-[13.5px] leading-relaxed text-[#3E2723]/75 mt-1 mb-6 line-clamp-4 ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? item.textAr : item.textEn}
                </p>

                {/* Author */}
                <div className={`flex items-center gap-3 border-t border-[#3E2723]/8 pt-4 ${isAr ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-[#3E2723]/8 flex items-center justify-center text-[#d4af37] font-bold text-base shrink-0">
                    {item.avatar}
                  </div>
                  <div className={isAr ? "text-right" : "text-left"}>
                    <p className="font-bold text-sm text-[#3E2723]">{isAr ? item.nameAr : item.nameEn}</p>
                    <p className="text-xs text-[#3E2723]/45 mt-0.5">{isAr ? item.locationAr : item.locationEn}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-300 rounded-full ${
              i === active ? "w-6 h-2 bg-[#d4af37]" : "w-2 h-2 bg-[#3E2723]/15 hover:bg-[#3E2723]/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
