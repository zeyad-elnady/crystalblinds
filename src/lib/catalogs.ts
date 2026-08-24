export interface CatalogItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
  categoryAr?: string;
  categoryEn?: string;
  fileUrl: string;
  coverImage?: string;
  fileSize?: string;
  created_at?: string;
}

export const CATALOGS_STORAGE_KEY = "crystal_catalogs";

export const DEFAULT_CATALOGS: CatalogItem[] = [
  {
    id: "cat-1",
    titleAr: "الكتالوج الشامل لستائر كريستال 2026",
    titleEn: "Crystal Blinds Complete Catalog 2026",
    descAr: "دليل شامل لجميع أنواع الستائر، الخامات، والألوان المتاحة",
    descEn: "Comprehensive guide for all curtain types, fabrics, and colors",
    categoryAr: "الكتالوج العام",
    categoryEn: "General Catalog",
    fileUrl: "/photos for crystal/printed_roller.png",
    coverImage: "/photos for crystal/printed_roller.png",
    fileSize: "12.4 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-2",
    titleAr: "كتالوج الستائر الذكية وأجهزة الموتور",
    titleEn: "Smart Blinds & Automation Catalog",
    descAr: "حلول الأتمتة الحديثة، مواتير Somfy و Azzurra، والتحكم الذكي",
    descEn: "Modern automation solutions, Somfy & Azzurra motors, and smart control",
    categoryAr: "الستائر الذكية",
    categoryEn: "Smart Curtains",
    fileUrl: "/photos for crystal/hero1.jpeg",
    coverImage: "/photos for crystal/hero1.jpeg",
    fileSize: "8.1 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-3",
    titleAr: "كتالوج ستائر رول وصن سكرين",
    titleEn: "Roller & Sunscreen Blinds Catalog",
    descAr: "تصاميم وأقمشة ستائر الرول والبلاك أوت والصن سكرين للمكاتب والمنازل",
    descEn: "Roller, blackout, and sunscreen designs for offices and homes",
    categoryAr: "ستائر رول",
    categoryEn: "Roller Blinds",
    fileUrl: "/photos for crystal/ستائر رول صن سكرين.jpeg",
    coverImage: "/photos for crystal/ستائر رول صن سكرين.jpeg",
    fileSize: "6.5 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-4",
    titleAr: "كتالوج الستائر الخشبية والبامبو",
    titleEn: "Wooden & Bamboo Blinds Catalog",
    descAr: "تشكيلة فاخرة من الستائر الشرائح الخشبية والبامبو الطبيعي",
    descEn: "Luxury collection of wooden blinds and natural bamboo",
    categoryAr: "ستائر خشبية",
    categoryEn: "Wooden Blinds",
    fileUrl: "/photos for crystal/ستائر شرائح خشبيه.jpeg",
    coverImage: "/photos for crystal/ستائر شرائح خشبيه.jpeg",
    fileSize: "5.2 MB",
    created_at: new Date().toISOString(),
  },
];

export function getStoredCatalogs(): CatalogItem[] {
  if (typeof window === "undefined") return DEFAULT_CATALOGS;
  try {
    const saved = localStorage.getItem(CATALOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading catalogs from localStorage:", e);
  }
  return DEFAULT_CATALOGS;
}

export function saveStoredCatalogs(catalogs: CatalogItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(catalogs));
  } catch (e) {
    console.error("Error saving catalogs to localStorage:", e);
  }
}
