import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "../globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "لوحة التحكم | Crystal Blinds",
  description: "لوحة إدارة مواعيد Crystal Blinds",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full" style={{ fontFamily: "var(--font-tajawal), sans-serif" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
