"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";

function CheckoutContent({ product, isAr, locale }: { product: Product, isAr: boolean, locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const width = searchParams.get("width") || "0";
  const height = searchParams.get("height") || "0";
  const colorId = searchParams.get("color") || "0";
  const typeId = searchParams.get("type") || "0";
  const pieces = searchParams.get("pieces") || "1";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Price calculation
  const widthVal = parseFloat(width);
  const heightVal = parseFloat(height);
  const area = widthVal > 0 && heightVal > 0 ? (widthVal / 100) * (heightVal / 100) : 1;
  const totalPrice = Math.round(product.price * area * parseInt(pieces));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert(isAr ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('orders').insert([{
      product_id: product.id,
      client_name: name,
      client_phone: phone,
      client_address: address,
      width: widthVal,
      height: heightVal,
      color_id: parseInt(colorId),
      type_id: parseInt(typeId),
      pieces: parseInt(pieces),
      total_price: totalPrice,
      status: 'pending'
    }]);

    setIsSubmitting(false);

    if (error) {
      alert(isAr ? "حدث خطأ أثناء إرسال الطلب" : "An error occurred while placing the order");
      console.error(error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/products`);
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center bg-[#FFFDFA] text-[#3E2723] ${isAr ? "rtl" : "ltr"}`}>
        <div className="bg-[#FFFDFA] p-12 rounded-2xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] text-center max-w-md border border-[#3E2723]/10">
          <span className="material-symbols-outlined text-6xl text-[#065f46] mb-4">check_circle</span>
          <h2 className="text-3xl font-bold mb-4 font-headline">{isAr ? "تم استلام طلبك بنجاح!" : "Order placed successfully!"}</h2>
          <p className="text-[#3E2723]/70 mb-8">{isAr ? "سنتواصل معك قريباً لتأكيد الطلب." : "We will contact you shortly to confirm your order."}</p>
          <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FFFDFA] text-[#3E2723] pt-32 pb-24 ${isAr ? "rtl" : "ltr"}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#3E2723] mb-8 text-center border-b-2 border-[#3E2723] pb-4 inline-block">
          {isAr ? "إتمام الطلب" : "Checkout"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          
          {/* Order Summary */}
          <div className="lg:col-span-5 bg-[#FFFDFA] p-8 rounded-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] border border-[#3E2723]/10 sticky top-32">
            <h2 className="text-xl font-bold mb-6 border-b border-[#3E2723]/10 pb-4">{isAr ? "ملخص الطلب" : "Order Summary"}</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-[#3E2723]/10">
                <img src={product.images[0]} alt={product.alt} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-[#3E2723] text-lg">{isAr ? product.labelAr : product.labelEn}</h3>
                <p className="text-sm text-[#3E2723]/60 mt-1">{isAr ? product.category : product.category}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#3E2723]/80 mb-6 bg-[#FFFDFA] p-4 rounded-lg">
              <div className="flex justify-between">
                <span>{isAr ? "الأبعاد:" : "Dimensions:"}</span>
                <span dir="ltr">{width} x {height} cm</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? "عدد القطع:" : "Pieces:"}</span>
                <span>{pieces}</span>
              </div>
            </div>

            <div className="border-t border-[#3E2723]/10 pt-6">
              <div className="flex justify-between items-center text-xl font-bold text-[#3E2723]">
                <span>{isAr ? "الإجمالي" : "Total"}</span>
                <span>{totalPrice.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-lg border border-[#d4af37]/20">
              <span className="material-symbols-outlined">payments</span>
              <span className="font-bold text-sm uppercase tracking-wider">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-7 bg-[#FFFDFA] p-8 rounded-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] border border-[#3E2723]/10">
            <h2 className="text-xl font-bold mb-6 border-b border-[#3E2723]/10 pb-4">{isAr ? "بيانات التوصيل" : "Delivery Details"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "الاسم الكامل *" : "Full Name *"}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "رقم الهاتف *" : "Phone Number *"}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "العنوان التفصيلي *" : "Detailed Address *"}</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors min-h-[120px] resize-none"
                  placeholder={isAr ? "المحافظة، المدينة، الشارع، رقم المبنى والشقة" : "City, Street, Building & Apartment"}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8922a] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all text-center disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {isSubmitting ? (isAr ? "جاري الإرسال..." : "Processing...") : (isAr ? "تأكيد الطلب" : "Confirm Order")}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient({ product, isAr, locale }: { product: Product, isAr: boolean, locale: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutContent product={product} isAr={isAr} locale={locale} />
    </Suspense>
  );
}
