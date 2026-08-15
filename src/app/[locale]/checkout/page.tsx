import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "إتمام الطلب | كريستال للستائر" : "Checkout | Crystal Blinds",
    description: isAr ? "صفحة الدفع وإتمام الطلب في كريستال للستائر" : "Checkout and place your order with Crystal Blinds",
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return <CheckoutClient isAr={isAr} locale={locale} />;
}
