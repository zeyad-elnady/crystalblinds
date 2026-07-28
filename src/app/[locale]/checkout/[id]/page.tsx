import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const isAr = locale === "ar";

  if (id === "cart") {
    return <CheckoutClient product={null} isAr={isAr} locale={locale} />;
  }

  const products = await getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return <CheckoutClient product={product} isAr={isAr} locale={locale} />;
}
