"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import PageHero from "../../PageHero";
import { GOVERNORATES, getDeliveryFees, type Governorate } from "@/lib/deliveryFees";
import { useCart } from "@/context/CartContext";

function CheckoutContent({ product, isAr, locale }: { product: Product | null, isAr: boolean, locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cart = useCart();
  const isCartCheckout = !product;

  const width = searchParams.get("width") || "0";
  const height = searchParams.get("height") || "0";
  const colorId = searchParams.get("color") || "0";
  const typeId = searchParams.get("type") || "0";
  const pieces = searchParams.get("pieces") || "1";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorates, setGovernorates] = useState<Governorate[]>(GOVERNORATES);
  
  const [selectedGovId, setSelectedGovId] = useState(() => {
    return searchParams.get("gov") || (isCartCheckout ? (cart.selectedGovernorateId || "") : "");
  });
  
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [buildingApartment, setBuildingApartment] = useState("");
  
  const [isInstallationSelected, setInstallationSelected] = useState(() => {
    const p = searchParams.get("install");
    if (p !== null) return p === "true";
    return isCartCheckout ? cart.isInstallationSelected : false;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet_instapay'>('cod');
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [transactionImageUrl, setTransactionImageUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isCartCheckout && cart.items.length === 0 && !success) {
      router.push(`/${locale}/products`);
    }
  }, [cart.items.length, isCartCheckout, success, router, locale]);

  useEffect(() => {
    if (isCartCheckout && selectedGovId) {
      cart.setGovernorate(selectedGovId);
    }
  }, [selectedGovId, isCartCheckout]);

  useEffect(() => {
    if (isCartCheckout) {
      cart.setInstallationSelected(isInstallationSelected);
    }
  }, [isInstallationSelected, isCartCheckout]);

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('transaction_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('transaction_images').getPublicUrl(fileName);
      setTransactionImageUrl(publicUrlData.publicUrl);
    } catch (err) {
      alert(isAr ? 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.' : 'Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    getDeliveryFees().then(data => setGovernorates(data));
  }, []);

  const selectedGov = governorates.find(g => g.id === selectedGovId);
  const deliveryFee = selectedGov ? selectedGov.fee : 0;
  const installationFee = isInstallationSelected ? 200 : 0;

  // Price calculation
  const widthVal = parseFloat(width);
  const heightVal = parseFloat(height);
  const area = widthVal > 0 && heightVal > 0 ? (widthVal / 100) * (heightVal / 100) : 1;
  const itemTotal = isCartCheckout
    ? cart.cartTotal
    : (product ? Math.round(product.price * area * parseInt(pieces)) : 0);
  const finalTotal = itemTotal + deliveryFee + installationFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedGovId || !city || !street || !buildingApartment) {
      alert(isAr ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    if (paymentMethod === 'wallet_instapay') {
      if (!transactionImageUrl) {
        alert(isAr ? "يرجى تحميل صورة التحويل قبل إتمام الطلب" : "Please upload the transaction screenshot before placing the order");
        return;
      }
      if (!whatsappNumber) {
        alert(isAr ? "يرجى إدخال رقم الواتساب للتواصل" : "Please enter the WhatsApp number for contact");
        return;
      }
    }

    setIsSubmitting(true);
    const govName = isAr ? (selectedGov?.nameAr || "") : (selectedGov?.nameEn || "");

    let error = null;

    if (isCartCheckout) {
      const groupOrderId = 'C-' + Math.floor(1000 + Math.random() * 9000);
      const mergedAddress = isAr
        ? `المحافظة: ${govName} | المدينة: ${city} | الشارع: ${street} | رقم المبنى والشقة: ${buildingApartment} | الخدمة: ${isInstallationSelected ? "توصيل وتركيب" : "توصيل فقط"} | كود الطلب: ${groupOrderId} | إجمالي الشحن والتركيب: ${deliveryFee + installationFee} ج.م`
        : `Governorate: ${govName} | City: ${city} | Street: ${street} | Building & Apartment: ${buildingApartment} | Service: ${isInstallationSelected ? "Delivery & Installation" : "Delivery Only"} | Order Code: ${groupOrderId} | Delivery & Install Total: ${deliveryFee + installationFee} EGP`;

      const payloads = cart.items.map((item, idx) => {
        const itemPriceTotal = item.price * item.quantity;
        const finalItemPrice = idx === 0 ? (itemPriceTotal + deliveryFee + installationFee) : itemPriceTotal;
        return {
          product_id: item.productId,
          client_name: name,
          client_phone: phone,
          client_address: mergedAddress,
          width: item.width || 0,
          height: item.height || 0,
          color_id: null,
          type_id: null,
          pieces: item.quantity,
          total_price: finalItemPrice,
          status: 'pending',
          payment_method: paymentMethod,
          whatsapp_number: paymentMethod === 'wallet_instapay' ? whatsappNumber : null,
          transaction_image_url: paymentMethod === 'wallet_instapay' ? transactionImageUrl : null,
          payment_status: paymentMethod === 'wallet_instapay' ? 'pending' : 'cod'
        };
      });

      const { error: insertError } = await supabase.from('orders').insert(payloads);
      error = insertError;
      if (!error) {
        cart.clearCart();
      }
    } else if (product) {
      const mergedAddress = isAr
        ? `المحافظة: ${govName} | المدينة: ${city} | الشارع: ${street} | رقم المبنى والشقة: ${buildingApartment} | الخدمة: ${isInstallationSelected ? "توصيل وتركيب" : "توصيل فقط"}`
        : `Governorate: ${govName} | City: ${city} | Street: ${street} | Building & Apartment: ${buildingApartment} | Service: ${isInstallationSelected ? "Delivery & Installation" : "Delivery Only"}`;

      const { error: insertError } = await supabase.from('orders').insert([{
        product_id: product.id,
        client_name: name,
        client_phone: phone,
        client_address: mergedAddress,
        width: widthVal,
        height: heightVal,
        color_id: parseInt(colorId),
        type_id: parseInt(typeId),
        pieces: parseInt(pieces),
        total_price: finalTotal,
        status: 'pending',
        payment_method: paymentMethod,
        whatsapp_number: paymentMethod === 'wallet_instapay' ? whatsappNumber : null,
        transaction_image_url: paymentMethod === 'wallet_instapay' ? transactionImageUrl : null,
        payment_status: paymentMethod === 'wallet_instapay' ? 'pending' : 'cod'
      }]);
      error = insertError;
    }

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
    <div className={`min-h-screen bg-[#FFFDFA] text-[#3E2723] pb-24 ${isAr ? "rtl" : "ltr"}`}>
      <PageHero
        title={isAr ? "إتمام الطلب" : "Checkout"}
        bgImage="/hero_bg.png"
        isAr={isAr}
        breadcrumbs={[
          { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
          { label: isAr ? "المنتجات" : "Products", href: `/${locale}/products` },
          ...(product ? [{ label: isAr ? product.labelAr : product.labelEn, href: `/${locale}/products/${product.id}` }] : []),
          { label: isAr ? "إتمام الطلب" : "Checkout" },
        ]}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Order Summary */}
          <div className="lg:col-span-5 bg-[#FFFDFA] p-8 rounded-xl shadow-[0_10px_30px_rgba(38,23,12,0.05)] border border-[#3E2723]/10 sticky top-32">
            <h2 className="text-xl font-bold mb-6 border-b border-[#3E2723]/10 pb-4">{isAr ? "ملخص الطلب" : "Order Summary"}</h2>

            {isCartCheckout ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-[#3E2723]/5 pb-3 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#3E2723]/10 bg-gray-100">
                      <img src={item.image} alt={isAr ? item.labelAr : item.labelEn} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#3E2723] truncate">{isAr ? item.labelAr : item.labelEn}</h4>
                      {item.width && item.height ? (
                        <p className="text-[10px] text-[#3E2723]/60 mt-0.5" dir="ltr">
                          {item.width} x {item.height} cm
                        </p>
                      ) : null}
                      <div className="flex justify-between items-center mt-1 text-[11px]">
                        <span className="text-[#3E2723]/70">{isAr ? "الكمية:" : "Qty:"} {item.quantity}</span>
                        <span className="font-bold text-[#d4af37]">{(item.price * item.quantity).toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : product ? (
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-[#3E2723]/10">
                  <img src={product.images[0]} alt={product.alt} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3E2723] text-lg">{isAr ? product.labelAr : product.labelEn}</h3>
                  <p className="text-sm text-[#3E2723]/60 mt-1">{isAr ? product.category : product.category}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-3 text-sm text-[#3E2723]/80 mb-6 bg-[#FFFDFA] p-4 rounded-lg">
              {!isCartCheckout && (
                <>
                  <div className="flex justify-between">
                    <span>{isAr ? "الأبعاد:" : "Dimensions:"}</span>
                    <span dir="ltr">{width} x {height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? "عدد القطع:" : "Pieces:"}</span>
                    <span>{pieces}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-[#3E2723]/5 pt-2">
                <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span>{itemTotal.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? "مصاريف الشحن:" : "Delivery Fee:"}</span>
                <span>
                  {selectedGovId 
                    ? `${deliveryFee.toLocaleString(isAr ? 'ar-EG' : 'en-US')} ${isAr ? "ج.م" : "EGP"}`
                    : (isAr ? "يحدد بعد اختيار المحافظة" : "Select governorate")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? "مصاريف التركيب:" : "Installation Fee:"}</span>
                <span>
                  {isInstallationSelected 
                    ? `${installationFee.toLocaleString(isAr ? 'ar-EG' : 'en-US')} ${isAr ? "ج.م" : "EGP"}`
                    : (isAr ? "توصيل فقط" : "Delivery only")}
                </span>
              </div>
            </div>

            <div className="border-t border-[#3E2723]/10 pt-6">
              <div className="flex justify-between items-center text-xl font-bold text-[#3E2723]">
                <span>{isAr ? "الإجمالي" : "Total"}</span>
                <span>{finalTotal.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
              </div>
            </div>

            {paymentMethod === 'cod' ? (
              <div className="mt-6 flex items-center justify-center gap-2 bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-lg border border-[#d4af37]/20">
                <span className="material-symbols-outlined">payments</span>
                <span className="font-bold text-sm uppercase tracking-wider">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-center gap-2 bg-[#d4af37]/10 text-[#d4af37] p-3 rounded-lg border border-[#d4af37]/20">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span className="font-bold text-sm uppercase tracking-wider">{isAr ? "الدفع بالمحفظة / إنستا باي" : "Wallet / InstaPay"}</span>
              </div>
            )}
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

              {/* Address Split (4 input boxes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "المحافظة *" : "Governorate *"}</label>
                  <select
                    value={selectedGovId}
                    onChange={(e) => setSelectedGovId(e.target.value)}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                    required
                  >
                    <option value="" disabled>
                      {isAr ? "-- اختر المحافظة --" : "-- Select Governorate --"}
                    </option>
                    {governorates.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {isAr ? gov.nameAr : gov.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "المدينة *" : "City *"}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder={isAr ? "اسم المدينة / المنطقة" : "City / District"}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "اسم الشارع *" : "Street *"}</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder={isAr ? "اسم الشارع" : "Street name"}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "رقم المبنى والشقة *" : "Building & Apartment *"}</label>
                  <input
                    type="text"
                    value={buildingApartment}
                    onChange={(e) => setBuildingApartment(e.target.value)}
                    className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder={isAr ? "رقم المبنى، الطابق، الشقة" : "Building no, Floor, Apartment"}
                    required
                  />
                </div>
              </div>

              {/* Service Type Option */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#3E2723]">{isAr ? "نوع الخدمة المطلوبة *" : "Required Service *"}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setInstallationSelected(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-right transition-all cursor-pointer ${!isInstallationSelected
                        ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_4px_12px_rgba(212,175,55,0.08)]'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/25 bg-[#FFFDFA]'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${!isInstallationSelected ? 'text-[#d4af37]' : 'text-[#3E2723]/60'}`}>local_shipping</span>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${!isInstallationSelected ? 'text-[#3E2723]' : 'text-[#3E2723]/80'}`}>
                        {isAr ? "توصيل فقط" : "Delivery Only"}
                      </p>
                      <p className="text-xs text-[#3E2723]/50 mt-0.5">
                        {isAr ? "شحن الستائر إلى باب منزلك" : "Ship curtains directly to your door"}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstallationSelected(true)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-right transition-all cursor-pointer ${isInstallationSelected
                        ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_4px_12px_rgba(212,175,55,0.08)]'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/25 bg-[#FFFDFA]'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${isInstallationSelected ? 'text-[#d4af37]' : 'text-[#3E2723]/60'}`}>handyman</span>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isInstallationSelected ? 'text-[#3E2723]' : 'text-[#3E2723]/80'}`}>
                        {isAr ? "توصيل وتركيب" : "Delivery & Installation"}
                      </p>
                      <p className="text-xs text-[#3E2723]/50 mt-0.5">
                        {isAr ? "شحن وتركيب احترافي (+200 ج.م)" : "Professional shipping & install (+200 EGP)"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[#3E2723]">{isAr ? "طريقة الدفع *" : "Payment Method *"}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-right transition-all cursor-pointer ${paymentMethod === 'cod'
                        ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_4px_12px_rgba(212,175,55,0.08)]'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/25 bg-[#FFFDFA]'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${paymentMethod === 'cod' ? 'text-[#d4af37]' : 'text-[#3E2723]/60'}`}>payments</span>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${paymentMethod === 'cod' ? 'text-[#3E2723]' : 'text-[#3E2723]/80'}`}>
                        {isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}
                      </p>
                      <p className="text-xs text-[#3E2723]/50 mt-0.5">
                        {isAr ? "الدفع نقداً عند توصيل الطلب" : "Pay with cash upon delivery"}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet_instapay')}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-right transition-all cursor-pointer ${paymentMethod === 'wallet_instapay'
                        ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_4px_12px_rgba(212,175,55,0.08)]'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/25 bg-[#FFFDFA]'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${paymentMethod === 'wallet_instapay' ? 'text-[#d4af37]' : 'text-[#3E2723]/60'}`}>account_balance_wallet</span>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${paymentMethod === 'wallet_instapay' ? 'text-[#3E2723]' : 'text-[#3E2723]/80'}`}>
                        {isAr ? "المحفظة الإلكترونية / إنستا باي" : "E-Wallet / InstaPay"}
                      </p>
                      <p className="text-xs text-[#3E2723]/50 mt-0.5">
                        {isAr ? "تحويل فوري فودافون كاش أو إنستا باي" : "Instant transfer via Vodafone Cash or InstaPay"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Wallet / InstaPay Inputs */}
              {paymentMethod === 'wallet_instapay' && (
                <div className="bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-xl p-6 space-y-6">
                  <div className="space-y-2 text-sm text-[#3E2723]/80">
                    <p className="font-bold text-base text-[#3E2723] mb-3">{isAr ? "بيانات التحويل:" : "Transfer Information:"}</p>
                    <div className="flex justify-between items-center bg-[#FFFDFA] p-3 rounded-lg border border-[#3E2723]/5">
                      <span>{isAr ? "محفظة فودافون كاش (Vodafone Cash):" : "Vodafone Cash Wallet:"}</span>
                      <strong className="text-[#d4af37]" dir="ltr">01100080609</strong>
                    </div>
                    <div className="flex justify-between items-center bg-[#FFFDFA] p-3 rounded-lg border border-[#3E2723]/5">
                      <span>{isAr ? "عنوان إنستا باي (InstaPay Address):" : "InstaPay Address:"}</span>
                      <strong className="text-[#d4af37]" dir="ltr">crystalblinds@instapay</strong>
                    </div>
                    <p className="text-xs text-[#3E2723]/60 mt-2">
                      {isAr
                        ? "* يرجى تحويل إجمالي مبلغ الطلب وإرفاق صورة التحويل أدناه لتأكيد الطلب."
                        : "* Please transfer the total order amount and attach the transfer receipt below to confirm."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "رقم الواتساب للتواصل *" : "WhatsApp Contact Number *"}</label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-[#FFFDFA] border border-[#3E2723]/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors"
                      placeholder={isAr ? "رقم الواتساب الخاص بك" : "Your WhatsApp number"}
                      dir="ltr"
                      required={paymentMethod === 'wallet_instapay'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#3E2723] mb-2">{isAr ? "إرفاق صورة التحويل *" : "Upload Transaction Screenshot *"}</label>
                    <div className="flex flex-col gap-4">
                      {transactionImageUrl ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#d4af37]">
                          <img src={transactionImageUrl} alt="Transaction Screenshot" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setTransactionImageUrl("")}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#3E2723]/20 rounded-lg cursor-pointer hover:border-[#d4af37] transition-colors bg-[#FFFDFA] ${uploadingFile ? 'opacity-70 pointer-events-none' : ''}`}>
                          <span className="material-symbols-outlined text-3xl text-[#3E2723]/40 mb-2">cloud_upload</span>
                          <span className="text-xs text-[#3E2723]/70 font-semibold">
                            {uploadingFile ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "اضغط لرفع صورة إيصال التحويل" : "Click to upload transfer receipt")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                            required={paymentMethod === 'wallet_instapay'}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

export default function CheckoutClient({ product, isAr, locale }: { product: Product | null, isAr: boolean, locale: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutContent product={product} isAr={isAr} locale={locale} />
    </Suspense>
  );
}
