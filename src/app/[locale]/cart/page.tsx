export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#faf8f5] px-6 text-center py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <span className="material-symbols-outlined text-[80px] md:text-[120px] text-[#d4af37] mb-8 drop-shadow-sm">
          shopping_bag
        </span>
        
        <h1 className="font-headline text-4xl md:text-6xl text-[#26170c] font-bold mb-4 tracking-tight">
          {isAr ? "المتجر قريباً" : "Shop is Coming Soon"}
        </h1>
        
        <div className="w-16 h-1 bg-[#d4af37] mb-8 rounded-full"></div>
        
        <p className="font-body text-[#26170c]/70 max-w-lg mx-auto text-base md:text-lg mb-12 leading-relaxed">
          {isAr
            ? "نعمل بجد لإطلاق متجرنا الإلكتروني قريباً لنقدم لك أفضل تجربة تسوق رقمية للستائر الفاخرة التي تستحقها."
            : "We are working hard to launch our online store soon, bringing you the seamless luxury window treatment shopping experience you deserve."}
        </p>
        
        <a
          href={`/${locale}`}
          className="group relative inline-flex items-center justify-center px-10 py-5 bg-transparent overflow-hidden border border-[#26170c]/20 rounded-sm hover:border-[#26170c] transition-colors"
        >
          {/* Fill effect */}
          <div className="absolute inset-0 bg-[#26170c] -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          
          <span className="relative z-10 text-[#26170c] group-hover:text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs md:text-sm transition-colors duration-500 flex items-center gap-3">
            <span className={`material-symbols-outlined text-sm transition-transform duration-500 group-hover:-translate-x-2 ${isAr ? 'rotate-180 group-hover:translate-x-2' : ''}`}>
              arrow_back
            </span>
            <span>{isAr ? "العودة للرئيسية" : "Return to Home"}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
