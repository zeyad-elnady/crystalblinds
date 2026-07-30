"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CatalogItem, getStoredCatalogs } from "@/lib/catalogs";

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
}

const DEFAULT_IMAGES: Record<string, string> = {
  "cat-1": "/photos for crystal/printed_roller.png",
  "cat-2": "/photos for crystal/hero1.jpeg",
  "cat-3": "/photos for crystal/ستائر رول صن سكرين.jpeg",
  "cat-4": "/photos for crystal/ستائر شرائح خشبيه.jpeg",
};

export default function CatalogModal({ isOpen, onClose, isAr }: CatalogModalProps) {
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCatalogs(getStoredCatalogs());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleDownload = (catalog: CatalogItem) => {
    const link = document.createElement("a");
    link.href = catalog.fileUrl;
    link.target = "_blank";
    link.download = (isAr ? catalog.titleAr : catalog.titleEn) || "catalog.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pt-24 pb-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.4)] flex flex-col max-h-[75vh] border border-white/10 my-auto"
        dir={isAr ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3E2723] px-6 py-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#d4af37] text-xl">menu_book</span>
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-white leading-snug">
                {isAr ? "كتالوجات كريستال بليندز" : "Crystal Blinds Catalogs"}
              </h3>
              <p className="text-xs text-white/60">
                {isAr ? "اختر الكتالوج المطلوب للتحميل بصيغة PDF" : "Choose a catalog to download as PDF"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content list with photos */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3.5 flex-1 bg-[#FAF7F3]">
          {catalogs.length === 0 ? (
            <div className="text-center py-12 text-[#3E2723]/60">
              <p>{isAr ? "لا توجد كتالوجات متاحة حالياً" : "No catalogs available currently"}</p>
            </div>
          ) : (
            catalogs.map((item) => {
              const photo = item.coverImage || DEFAULT_IMAGES[item.id] || "/photos for crystal/printed_roller.png";
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#3E2723]/8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-3.5 justify-between group"
                >
                  {/* Photo + Info */}
                  <div className={`flex items-center gap-3.5 w-full sm:w-auto flex-1 ${isAr ? "flex-row" : ""}`}>
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#3E2723]/10 relative group-hover:border-white/40 transition-colors">
                      <img
                        src={photo}
                        alt={item.titleAr}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/photos for crystal/printed_roller.png";
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-[#3E2723] text-sm md:text-base leading-snug">
                        {isAr ? item.titleAr : item.titleEn}
                      </h4>
                      {(item.descAr || item.descEn) && (
                        <p className="text-xs text-[#3E2723]/60 leading-relaxed line-clamp-1">
                          {isAr ? item.descAr : item.descEn}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {(item.categoryAr || item.categoryEn) && (
                          <span className="text-[10px] font-semibold text-[#b8922a]">
                            {isAr ? item.categoryAr : item.categoryEn}
                          </span>
                        )}
                        {item.fileSize && (
                          <span className="text-[10px] text-[#3E2723]/40 font-mono">
                            {item.fileSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(item)}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-[#3E2723] hover:bg-[#2B1B17] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[#d4af37] text-base">file_download</span>
                    <span>{isAr ? "تحميل PDF" : "Download PDF"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-3.5 border-t border-[#3E2723]/8 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#3E2723]/40">
            {isAr ? "جميع الملفات بصيغة PDF عالية الجودة" : "All files available in high quality PDF format"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#3E2723]/5 hover:bg-[#3E2723]/10 text-xs font-bold text-[#3E2723] transition-colors"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
