import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import ProductDetailsClient from "./ProductDetailsClient";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const isAr = locale === "ar";

  return <ProductDetailsClient product={product} isAr={isAr} locale={locale} />;
}
