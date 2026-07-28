"use client";

import { useState } from "react";
import Link from "next/link";
import { type Product, type ProductCategory } from "@/lib/products";
import CatalogModal from "@/components/CatalogModal";


function ProductCardItem({
  product,
  isAr
}: {
  product: Product;
  isAr: boolean;
}) {
  return (
    <div className="group flex flex-col bg-[#FFFDFA]/60 border border-white/50 rounded-xl overflow-hidden hover:bg-[#FFFDFA]/80 transition-all duration-500 hover:shadow-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] backdrop-blur-md">
      {/* Image Swap */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0 group/image">
        {/* Main image */}
        <img
          src={product.images[0]}
          alt={product.alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${product.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
        />

        {/* Hover image */}
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.alt} hover`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-6 ${isAr ? "items-end" : "items-start"}`}>
        <div className={`w-full flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-semibold">
            {isAr ? "الأقمشة الفاخرة" : "Artisan Fabrics"}
          </span>
          {/* Price */}
          <span className="text-[#3E2723] font-bold text-sm bg-[#FFFDFA]/50 px-2.5 py-1 rounded shadow-sm border border-white/60">
            {product.price.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
          </span>
        </div>

        <h4 className="font-headline text-xl text-[#3E2723] font-bold mb-3">
          {isAr ? product.labelAr : product.labelEn}
        </h4>
        <p className="text-[#3E2723]/70 text-sm leading-relaxed mb-4 flex-1">
          {isAr ? product.descAr : product.descEn}
        </p>

        <Link
          href={`/${isAr ? 'ar' : 'en'}/products/${product.id}`}
          className={`flex items-center gap-2 text-white bg-[#3E2723] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#d4af37] transition-colors mt-auto w-fit shadow-md ${isAr ? "mr-auto flex-row-reverse" : "ml-auto"}`}
        >
          <span>
            {isAr ? "عرض التفاصيل" : "View Details"}
          </span>
          <span className={`material-symbols-outlined text-sm ${isAr ? "rotate-180" : ""}`}>
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ProductCards({ isAr, products, categories, isBrief = false }: { isAr: boolean, products: Product[], categories: ProductCategory[], isBrief?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const filteredProducts = isBrief
    ? products.slice(0, 4)
    : activeCategory === "All"
    ? products
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const allCategoryTab = { slug: "All", nameEn: "All", nameAr: "الكل" };
  const displayCategories = [allCategoryTab, ...categories];

  return (
    <div className="w-full flex flex-col items-center px-6 md:px-12 pb-16 pt-8">
      {/* Catalog Modal */}
      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        isAr={isAr}
      />

      {/* Filter Tabs & Catalog Download */}
      {!isBrief && (
        <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-12 ${isAr ? "flex-row-reverse" : ""}`}>
          {/* Download Catalog Button */}
          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold bg-[#3E2723] text-white hover:bg-[#2B1B17] shadow-md hover:shadow-lg transition-all duration-300 border border-[#d4af37]/30"
          >
            <span className="material-symbols-outlined text-[#d4af37] text-base md:text-lg">file_download</span>
            <span>{isAr ? "تحميل الكتالوج" : "Download Catalog"}</span>
          </button>

          <div className="w-[1px] h-6 bg-[#3E2723]/15 hidden sm:block my-auto" />

          {displayCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setExpandedId(null);
                }}
                className={`px-5 md:px-7 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 shadow-sm
                  ${isActive
                    ? "bg-[#3E2723] text-white border-[#3E2723] shadow-md scale-105"
                    : "bg-white text-[#3E2723]/60 border-[#3E2723]/10 hover:border-[#3E2723]/30 hover:bg-[#FFFDFA] hover:text-[#3E2723]"
                  }`}
              >
                {isAr ? cat.nameAr : cat.nameEn}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl items-start ${isAr ? "rtl text-right" : "ltr text-left"}`}>
        {filteredProducts.map((product) => (
          <ProductCardItem
            key={product.id}
            product={product}
            isAr={isAr}
          />
        ))}
      </div>
    </div>
  );
}
