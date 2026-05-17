import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import ProductDetailsClient from "./ProductDetailsClient";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const isAr = locale === "ar";

  return <ProductDetailsClient product={product} isAr={isAr} locale={locale} />;
}
