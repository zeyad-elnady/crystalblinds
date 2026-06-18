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
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full overflow-hidden`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full overflow-hidden" style={{ fontFamily: "var(--font-tajawal), sans-serif", minHeight: '100%', height: '100%' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
