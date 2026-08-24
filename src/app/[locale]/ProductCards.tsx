"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type Product, type ProductCategory } from "@/lib/products";
import CatalogModal from "@/components/CatalogModal";

function ProductCardItem({
  product,
  isAr
}: {
  product: Product;
  isAr: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const hasHoverImage = product.images.length > 1;

  return (
    <div
      className="flex flex-col bg-[#FFFDFA]/60 border border-white/50 rounded-xl overflow-hidden hover:bg-[#FFFDFA]/80 transition-all duration-500 hover:shadow-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] backdrop-blur-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Swap */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0">
        {/* Main image */}
        <img
          src={product.images[0]}
          alt={product.alt}
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: hovered && hasHoverImage ? 0 : 1 }}
        />

        {/* Hover image */}
        {hasHoverImage && (
          <img
            src={product.images[1]}
            alt={`${product.alt} hover`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: hovered ? 1 : 0 }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-6 ${isAr ? "items-end" : "items-start"}`}>
        <div className={`w-full flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-[#3E2723]/60 text-xs uppercase tracking-[0.2em] font-semibold">
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
          href={`/${isAr ? 'ar' : 'en'}/products/${product.slug || product.id}`}
          className={`flex items-center gap-2 text-white bg-[#3E2723] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#2C1D18] transition-colors mt-auto w-fit shadow-md ${isAr ? "mr-auto flex-row-reverse" : "ml-auto"}`}
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

const cleanStr = (s: string) => s.trim().toLowerCase().replace(/[-_\s]+/g, '');

export default function ProductCards({
  isAr,
  products,
  categories,
  isBrief = false
}: {
  isAr: boolean;
  products: Product[];
  categories: ProductCategory[];
  isBrief?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categoryParam = searchParams ? searchParams.get("category") : null;
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const allCategoryTab: ProductCategory = { id: "all", slug: "all", nameEn: "All", nameAr: "الكل", sort_order: 0 };

  // Combine categories and ensure unique tabs
  const displayCategories = useMemo(() => {
    const list: ProductCategory[] = [allCategoryTab];
    const seen = new Set<string>(['all']);

    (categories || []).forEach(cat => {
      const key = cleanStr(cat.slug || cat.nameEn || '');
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push({
          ...cat,
          slug: cat.slug || key
        });
      }
    });

    // Also include any product categories not in list
    (products || []).forEach(p => {
      if (p.category) {
        const key = cleanStr(p.category);
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            id: `cat-${key}`,
            slug: key,
            nameEn: p.category,
            nameAr: p.category,
            sort_order: 99
          });
        }
      }
    });

    return list;
  }, [categories, products]);

  // Synchronize state when URL category query param changes (e.g. initial load or browser back/forward)
  useEffect(() => {
    if (!categoryParam || cleanStr(categoryParam) === 'all' || cleanStr(categoryParam) === 'الكل') {
      setActiveCategory("all");
      return;
    }

    const cleanParam = cleanStr(categoryParam);
    const matched = displayCategories.find(
      (cat) =>
        cleanStr(cat.slug) === cleanParam ||
        cleanStr(cat.nameEn) === cleanParam ||
        cleanStr(cat.nameAr) === cleanParam
    );

    if (matched) {
      setActiveCategory(matched.slug);
    } else {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam, displayCategories]);

  // Handle clicking a category tab: updates state and pushes new URL query param
  const handleCategorySelect = (cat: ProductCategory) => {
    const isAll = cleanStr(cat.slug) === 'all';
    setActiveCategory(isAll ? "all" : cat.slug);

    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (isAll) {
      params.delete('category');
    } else {
      params.set('category', cat.slug.toLowerCase());
    }

    const query = params.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;
    router.push(targetUrl, { scroll: false });
  };

  const isMatch = (productCategory: string, selectedSlug: string) => {
    if (!selectedSlug || cleanStr(selectedSlug) === 'all') return true;
    const cleanSelected = cleanStr(selectedSlug);
    const cleanProduct = cleanStr(productCategory);
    if (cleanProduct === cleanSelected) return true;

    const matchedCat = displayCategories.find(c =>
      cleanStr(c.slug) === cleanSelected ||
      cleanStr(c.nameEn) === cleanSelected ||
      cleanStr(c.nameAr) === cleanSelected
    );

    if (matchedCat) {
      if (cleanProduct === cleanStr(matchedCat.slug)) return true;
      if (cleanProduct === cleanStr(matchedCat.nameEn)) return true;
      if (cleanProduct === cleanStr(matchedCat.nameAr)) return true;
    }

    return false;
  };

  const filteredProducts = isBrief
    ? products.slice(0, 4)
    : products.filter(p => isMatch(p.category, activeCategory));

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
            <span className="material-symbols-outlined text-white/80 text-base md:text-lg">file_download</span>
            <span>{isAr ? "تحميل الكتالوج" : "Download Catalog"}</span>
          </button>

          <div className="w-[1px] h-6 bg-[#3E2723]/15 hidden sm:block my-auto" />

          {displayCategories.map((cat) => {
            const isActive = cleanStr(activeCategory) === cleanStr(cat.slug);
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategorySelect(cat)}
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
      {filteredProducts.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl items-start ${isAr ? "rtl text-right" : "ltr text-left"}`}>
          {filteredProducts.map((product) => (
            <ProductCardItem
              key={product.id}
              product={product}
              isAr={isAr}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 max-w-md mx-auto bg-white/80 border border-[#3E2723]/10 rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#3E2723]/40 mb-3">inventory_2</span>
          <h3 className="text-lg font-bold text-[#3E2723] mb-2">
            {isAr ? "لا توجد منتجات متوفرة حالياً في هذا القسم" : "No products found in this category"}
          </h3>
          <p className="text-sm text-[#3E2723]/60 mb-6">
            {isAr ? "يمكنك استعراض باقي الأقسام أو الرجوع لكافة المنتجات" : "You can browse other categories or view all products"}
          </p>
          <button
            onClick={() => handleCategorySelect(allCategoryTab)}
            className="px-6 py-2.5 bg-[#3E2723] text-white text-xs font-bold rounded-lg hover:bg-[#2B1B17] transition-colors"
          >
            {isAr ? "عرض جميع المنتجات" : "View All Products"}
          </button>
        </div>
      )}
    </div>
  );
}
