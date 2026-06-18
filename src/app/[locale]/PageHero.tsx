import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

export default function PageHero({
  title,
  bgImage,
  isAr,
  breadcrumbs,
}: {
  title: string;
  bgImage: string;
  isAr: boolean;
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <section className="relative w-full h-[280px] md:h-[360px] flex items-center justify-center">
      {/* Background Image Container (clips the image and overlays, allowing breadcrumbs to overflow) */}
      <div className="absolute inset-0 z-0 rounded-b-[2rem] md:rounded-b-[3rem] overflow-hidden border-b-2 border-[#d4af37]/30">
        <img
          src={bgImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-[#3E2723]/60 mix-blend-multiply" />
        {/* Double-layered gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/40 via-transparent to-[#3E2723]/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mt-6 md:mt-10">
        <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl text-white font-extrabold tracking-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
          {title}
        </h1>
        <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mb-6" />
      </div>

      {/* Floating Breadcrumb Bar */}
      <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
        <div className={`flex items-center gap-2 bg-[#3E2723]/95 backdrop-blur-md rounded-full px-6 py-2.5 border border-[#d4af37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.15)] text-xs md:text-sm font-medium text-white/90 whitespace-nowrap ${isAr ? "flex-row-reverse" : ""}`}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                {idx > 0 && (
                  <span className="material-symbols-outlined text-[#d4af37] text-[14px] md:text-[16px] select-none opacity-60">
                    {isAr ? "chevron_left" : "chevron_right"}
                  </span>
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#d4af37] transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#d4af37] font-semibold">{crumb.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
