import { permanentRedirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CheckoutSlugPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CheckoutSlugPage({ params }: CheckoutSlugPageProps) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/checkout`);
}
