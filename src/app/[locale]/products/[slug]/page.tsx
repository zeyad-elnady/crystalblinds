import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlugOrId, getProducts } from "@/lib/products";
import ProductDetailsClient from "./ProductDetailsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const { product, canonicalSlug } = await getProductBySlugOrId(slug);

  if (!product) {
    return {
      title: isAr ? "المنتج غير موجود | كريستال للستائر" : "Product Not Found | Crystal Blinds",
    };
  }

  const title = isAr ? `${product.labelAr} | كريستال للستائر` : `${product.labelEn} | Crystal Blinds`;
  const description = isAr ? product.descAr || product.detailsAr : product.descEn || product.detailsEn;
  const baseUrl = "https://crystalblinds-eg.com";
  const canonicalUrl = `${baseUrl}/${locale}/products/${canonicalSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: `${baseUrl}/ar/products/${canonicalSlug}`,
        en: `${baseUrl}/en/products/${canonicalSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Crystal Blinds Egypt",
      images: product.images && product.images.length > 0 ? [
        {
          url: product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`,
          width: 800,
          height: 800,
          alt: product.alt || title,
        }
      ] : [],
      locale: isAr ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const { product, isLegacy, canonicalSlug } = await getProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  // 301 Permanent Redirect if accessed via legacy UUID or non-canonical URL
  if (isLegacy && canonicalSlug && slug !== canonicalSlug) {
    permanentRedirect(`/${locale}/products/${canonicalSlug}`);
  }

  const isAr = locale === "ar";

  return <ProductDetailsClient product={product} isAr={isAr} locale={locale} />;
}
