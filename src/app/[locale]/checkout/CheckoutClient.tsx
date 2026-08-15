"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHero from "../PageHero";
import { supabase } from "@/lib/supabase";
import { GOVERNORATES, getDeliveryFees, type Governorate } from "@/lib/deliveryFees";
import { useCart } from "@/context/CartContext";
import { isValidEgyptianPhone, sanitizePhoneInput } from "@/lib/validation";

export default function CheckoutClient({ isAr, locale }: { isAr: boolean; locale: string }) {
  const router = useRouter();
  const cart = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [governorates, setGovernorates] = useState<Governorate[]>(GOVERNORATES);
  
  const [selectedGovId, setSelectedGovId] = useState(() => cart.selectedGovernorateId || "");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [buildingApartment, setBuildingApartment] = useState("");
  const [isInstallationSelected, setInstallationSelected] = useState<boolean>(() => cart.isInstallationSelected);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet_instapay'>('cod');
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [transactionImageUrl, setTransactionImageUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (selectedGovId) {
      cart.setGovernorate(selectedGovId);
    }
  }, [selectedGovId]);

  useEffect(() => {
    cart.setInstallationSelected(isInstallationSelected);
  }, [isInstallationSelected]);

  useEffect(() => {
    getDeliveryFees().then(data => setGovernorates(data));
  }, []);

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

  const selectedGov = governorates.find(g => g.id === selectedGovId);
  const deliveryFee = selectedGov ? selectedGov.fee : 0;
  const installationFee = isInstallationSelected ? 200 : 0;
  const finalTotal = cart.cartTotal + deliveryFee + installationFee;

  const isPhoneValid = isValidEgyptianPhone(phone);
  const isWhatsappValid = isValidEgyptianPhone(whatsappNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      alert(isAr ? "سلة المشتريات فارغة" : "Your cart is empty");
      return;
    }

    if (!name || !phone || !selectedGovId || !city || !street || !buildingApartment) {
      alert(isAr ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    if (!isValidEgyptianPhone(phone)) {
      setPhoneTouched(true);
      alert(isAr ? "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)" : "Please enter a valid Egyptian phone number (e.g. 01012345678)");
      return;
    }

    if (paymentMethod === 'wallet_instapay') {
      if (!isValidEgyptianPhone(whatsappNumber)) {
        setWhatsappTouched(true);
        alert(isAr ? "يرجى إدخال رقم واتساب مصري صحيح (مثال: 01012345678)" : "Please enter a valid Egyptian WhatsApp number (e.g. 01012345678)");
        return;
      }
      if (!transactionImageUrl) {
        alert(isAr ? "يرجى تحميل صورة التحويل قبل إتمام الطلب" : "Please upload the transaction screenshot before placing the order");
        return;
      }
    }

    setIsSubmitting(true);
    const govName = isAr ? (selectedGov?.nameAr || "") : (selectedGov?.nameEn || "");

    const groupOrderId = 'C-' + Math.floor(1000 + Math.random() * 9000);
    const mergedAddress = isAr
      ? `المحافظة: ${govName} | المدينة: ${city} | الشارع: ${street} | رقم المبنى والشقة: ${buildingApartment} | الخدمة: ${isInstallationSelected ? "توصيل وتركيب" : "توصيل فقط"} | كود الطلب: ${groupOrderId} | إجمالي الشحن والتركيب: ${deliveryFee + installationFee} ج.م`
      : `Governorate: ${govName} | City: ${city} | Street: ${street} | Building & Apartment: ${buildingApartment} | Service: ${isInstallationSelected ? "Delivery & Installation" : "Delivery Only"} | Order Code: ${groupOrderId} | Delivery & Install Total: ${deliveryFee + installationFee} EGP`;

    const payloads = cart.items.map((item, idx) => {
      const itemPriceTotal = item.price * item.quantity;
      const finalItemPrice = idx === 0 ? (itemPriceTotal + deliveryFee + installationFee) : itemPriceTotal;
      const colorText = item.colorName ? ` [اللون: ${item.colorName}]` : '';
      return {
        product_id: item.productId,
        client_name: name,
        client_phone: phone,
        client_address: mergedAddress + colorText,
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
    setIsSubmitting(false);

    if (insertError) {
      alert(isAr ? "حدث خطأ أثناء إرسال الطلب" : "An error occurred while placing the order");
      console.error(insertError);
    } else {
      cart.clearCart();
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/products`);
      }, 3500);
    }
  };

  if (success) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center bg-[#FFFDFA] text-[#3E2723] px-4 ${isAr ? "rtl" : "ltr"}`}>
        <div className="bg-[#FFFDFA] p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgba(38,23,12,0.08)] text-center max-w-lg border border-[#3E2723]/10">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-[#065f46]">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-headline text-[#3E2723]">
            {isAr ? "تم استلام طلبك بنجاح!" : "Order Placed Successfully!"}
          </h2>
          <p className="text-[#3E2723]/70 text-sm md:text-base mb-6 leading-relaxed">
            {isAr ? "شكراً لاختيارك كريستال بليندز. سنتواصل معك هاتفياً أو عبر الواتساب لتأكيد موعد التجهيز والشحن." : "Thank you for choosing Crystal Blinds. Our team will contact you shortly to confirm your delivery schedule."}
          </p>
          <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
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
          { label: isAr ? "إتمام الطلب" : "Checkout" },
        ]}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-12 pt-10 md:pt-14">
        {cart.items.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#3E2723]/10 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#3E2723]/40">
              <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#3E2723] mb-2">
              {isAr ? "سلة المشتريات فارغة حالياً" : "Your cart is currently empty"}
            </h3>
            <p className="text-xs text-[#3E2723]/60 mb-6">
              {isAr ? "تصفح تشكيلتنا المميزة واختر مقاسات الستارة المطلوبة للمتابعة" : "Browse our premium blinds and select your custom sizes to proceed"}
            </p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center gap-2 bg-[#2C1D18] hover:bg-[#3E2723] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>{isAr ? "تصفح المنتجات" : "Explore Products"}</span>
              <span className="material-symbols-outlined text-sm">{isAr ? "arrow_back" : "arrow_forward"}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgba(38,23,12,0.04)] border border-[#3E2723]/10 sticky top-28">
              <div className="flex items-center justify-between border-b border-[#3E2723]/10 pb-4 mb-6">
                <h2 className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4af37] text-xl">shopping_bag</span>
                  {isAr ? "ملخص الطلب" : "Order Summary"}
                </h2>
                <span className="text-xs font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-full text-[#3E2723]/70 border border-[#3E2723]/10">
                  {cart.itemCount} {isAr ? "قطع" : "items"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#3E2723]/5 relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#3E2723]/10 bg-white">
                      <img src={item.image} alt={isAr ? item.labelAr : item.labelEn} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-xs text-[#3E2723] truncate">{isAr ? item.labelAr : item.labelEn}</h4>
                          <button
                            type="button"
                            onClick={() => cart.removeFromCart(item.id)}
                            className="text-[#3E2723]/40 hover:text-red-600 transition-colors p-0.5"
                            title={isAr ? "حذف" : "Remove"}
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                        {item.width && item.height ? (
                          <p className="text-[11px] text-[#3E2723]/60 mt-0.5 font-medium" dir="ltr">
                            {item.width} x {item.height} m
                          </p>
                        ) : null}
                        {item.colorName && (
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#3E2723]/70">
                            {item.colorHex && (
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: item.colorHex }} />
                            )}
                            <span>{item.colorName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#3E2723]/5 text-xs">
                        <div className="flex items-center bg-white rounded-lg border border-[#3E2723]/10 px-1 py-0.5 gap-1.5">
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#3E2723] hover:bg-gray-100 rounded text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#3E2723] hover:bg-gray-100 rounded text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-extrabold text-[#d4af37] text-sm">
                          {(item.price * item.quantity).toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#3E2723]/80 bg-[#FAF8F5] p-4 rounded-xl border border-[#3E2723]/10 mb-6">
                <div className="flex justify-between">
                  <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
                  <span className="font-bold text-[#3E2723]">{cart.cartTotal.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? "مصاريف الشحن والتوصيل:" : "Delivery Fee:"}</span>
                  <span className="font-bold text-[#3E2723]">
                    {selectedGov
                      ? `${deliveryFee.toLocaleString(isAr ? 'ar-EG' : 'en-US')} ${isAr ? "ج.م" : "EGP"}`
                      : (isAr ? "يحدد بعد اختيار المحافظة" : "Select governorate")}
                  </span>
                </div>
                {isInstallationSelected && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{isAr ? "رسوم خدمة التركيب:" : "Installation Fee:"}</span>
                    <span className="font-bold">+{installationFee.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#3E2723]/10 pt-3 text-sm font-bold text-[#3E2723]">
                  <span>{isAr ? "الإجمالي الكلي:" : "Total Amount:"}</span>
                  <span className="text-[#d4af37] text-base font-headline font-black">
                    {finalTotal.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-[#3E2723]/70 pt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#065f46]">verified_user</span>
                  <span>{isAr ? "ضمان شامل 3 سنوات على كافة الأقمشة والماكينات" : "3 Years full warranty"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#065f46]">local_shipping</span>
                  <span>{isAr ? "شحن آمن وتوصيل سريع حتى باب المنزل" : "Fast & safe doorstep delivery"}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form Column */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgba(38,23,12,0.04)] border border-[#3E2723]/10">
              <h2 className="text-lg font-bold text-[#3E2723] mb-6 border-b border-[#3E2723]/10 pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37] text-xl">location_on</span>
                {isAr ? "بيانات الشحن والعنوان" : "Shipping & Contact Details"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80">
                    {isAr ? "الاسم بالكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#3E2723]/20 rounded-xl p-3.5 text-sm font-semibold focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
                    placeholder={isAr ? "أدخل اسمك بالكامل" : "Enter your full name"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80 flex items-center justify-between">
                    <span>{isAr ? "رقم الهاتف للتواصل *" : "Phone Number *"}</span>
                    {phone.length > 0 && (
                      <span className={`text-[10px] font-bold ${isPhoneValid ? "text-emerald-600" : "text-amber-600"}`}>
                        {isPhoneValid ? (isAr ? "رقم صحيح ✓" : "Valid ✓") : `${phone.length}/11`}
                      </span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                      onBlur={() => setPhoneTouched(true)}
                      maxLength={15}
                      className={`w-full bg-[#FAF8F5] border rounded-xl p-3.5 text-sm font-semibold transition-all focus:outline-none ${
                        phoneTouched && !isPhoneValid
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                          : isPhoneValid
                          ? "border-emerald-500/60 bg-emerald-50/10 focus:border-emerald-600"
                          : "border-[#3E2723]/20 focus:border-[#d4af37] focus:bg-white"
                      }`}
                      placeholder={isAr ? "01xxxxxxxxx" : "01xxxxxxxxx"}
                      dir="ltr"
                    />
                    {isPhoneValid && (
                      <span className="absolute right-3.5 text-emerald-600 material-symbols-outlined text-lg pointer-events-none">
                        check_circle
                      </span>
                    )}
                  </div>
                  {phoneTouched && !isPhoneValid && (
                    <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {isAr
                        ? "يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)"
                        : "Please enter a valid 11-digit Egyptian phone number (e.g. 01012345678)"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80">
                      {isAr ? "المحافظة *" : "Governorate *"}
                    </label>
                    <select
                      required
                      value={selectedGovId}
                      onChange={(e) => setSelectedGovId(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#3E2723]/20 rounded-xl p-3.5 text-sm font-semibold focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">{isAr ? "اختر المحافظة" : "Select Governorate"}</option>
                      {governorates.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {isAr ? gov.nameAr : gov.nameEn} ({gov.fee} {isAr ? "ج.م" : "EGP"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80">
                      {isAr ? "المدينة / الحي *" : "City / District *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#3E2723]/20 rounded-xl p-3.5 text-sm font-semibold focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
                      placeholder={isAr ? "مثال: المعادي / التجمع / الشيخ زايد" : "e.g. Maadi / Zayed"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80">
                      {isAr ? "اسم الشارع *" : "Street Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#3E2723]/20 rounded-xl p-3.5 text-sm font-semibold focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
                      placeholder={isAr ? "مثال: شارع النصر" : "e.g. El-Nasr St."}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#3E2723]/80">
                      {isAr ? "رقم المبنى والعمارة / الشقة *" : "Building & Apartment No. *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={buildingApartment}
                      onChange={(e) => setBuildingApartment(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#3E2723]/20 rounded-xl p-3.5 text-sm font-semibold focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
                      placeholder={isAr ? "عمارة 5، شقة 12" : "Bldg 5, Apt 12"}
                    />
                  </div>
                </div>

                {/* Professional Installation Option */}
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#3E2723]/10 mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstallationSelected}
                      onChange={(e) => setInstallationSelected(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#3E2723]/30 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <div>
                      <span className="font-bold text-xs md:text-sm text-[#3E2723] block">
                        {isAr ? "إضافة خدمة التركيب الاحترافي (+200 ج.م)" : "Add Professional Installation (+200 EGP)"}
                      </span>
                      <span className="text-[11px] text-[#3E2723]/70 block mt-0.5 leading-relaxed">
                        {isAr
                          ? "فني متخصص يقوم بتركيب الستائر وضمان استوائها وتجربتها بأعلى دقة"
                          : "A professional technician will install and guarantee flawless setup"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Payment Method Selector */}
                <div className="border-t border-[#3E2723]/10 pt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-[#3E2723]/80">
                    {isAr ? "طريقة الدفع *" : "Payment Method *"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#d4af37] bg-[#FAF8F5] ring-1 ring-[#d4af37]/40 shadow-xs' : 'border-[#3E2723]/15'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3E2723]">payments</span>
                        <span className="text-xs font-bold text-[#3E2723]">{isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery"}</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'wallet_instapay' ? 'border-[#d4af37] bg-[#FAF8F5] ring-1 ring-[#d4af37]/40 shadow-xs' : 'border-[#3E2723]/15'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="wallet_instapay"
                        checked={paymentMethod === 'wallet_instapay'}
                        onChange={() => setPaymentMethod('wallet_instapay')}
                        className="text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3E2723]">account_balance_wallet</span>
                        <span className="text-xs font-bold text-[#3E2723]">{isAr ? "إنستاباي / محفظة إلكترونية" : "InstaPay / Wallet"}</span>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'wallet_instapay' && (
                    <div className="mt-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#d4af37]/30 space-y-4 animate-in fade-in duration-200">
                      <div className="text-xs text-[#3E2723] leading-relaxed">
                        <p className="font-bold text-[#d4af37] mb-1">{isAr ? "بيانات التحويل:" : "Transfer Details:"}</p>
                        <p>{isAr ? "رقم إنستاباي / فودافون كاش: " : "InstaPay / Vodafone Cash: "} <strong className="font-mono text-sm">01000000000</strong></p>
                        <p className="text-[11px] text-[#3E2723]/70 mt-1">
                          {isAr ? "يرجى تحويل المبلغ الإجمالي ثم إرفاق إيصال التحويل ورقم الواتساب الخاص بك للمتابعة." : "Please transfer total amount then upload receipt and WhatsApp number."}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>{isAr ? "رقم الواتساب المسجل به التحويل *" : "WhatsApp Number *"}</span>
                          {whatsappNumber.length > 0 && (
                            <span className={`text-[10px] font-bold ${isWhatsappValid ? "text-emerald-600" : "text-amber-600"}`}>
                              {isWhatsappValid ? (isAr ? "رقم صحيح ✓" : "Valid ✓") : `${whatsappNumber.length}/11`}
                            </span>
                          )}
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="tel"
                            required={paymentMethod === 'wallet_instapay'}
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(sanitizePhoneInput(e.target.value))}
                            onBlur={() => setWhatsappTouched(true)}
                            maxLength={15}
                            className={`w-full bg-white border rounded-lg p-2.5 text-xs font-semibold focus:outline-none transition-all ${
                              whatsappTouched && !isWhatsappValid
                                ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                : isWhatsappValid
                                ? "border-emerald-500/60 bg-emerald-50/10 focus:border-emerald-600"
                                : "border-[#3E2723]/20 focus:border-[#3E2723]"
                            }`}
                            placeholder="01xxxxxxxxx"
                            dir="ltr"
                          />
                          {isWhatsappValid && (
                            <span className="absolute right-2.5 text-emerald-600 material-symbols-outlined text-base pointer-events-none">
                              check_circle
                            </span>
                          )}
                        </div>
                        {whatsappTouched && !isWhatsappValid && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-xs">error</span>
                            {isAr
                              ? "يرجى إدخال رقم واتساب مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)"
                              : "Please enter a valid 11-digit Egyptian WhatsApp number (e.g. 01012345678)"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          {isAr ? "صورة إيصال التحويل *" : "Payment Receipt Screenshot *"}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          required={paymentMethod === 'wallet_instapay' && !transactionImageUrl}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#3E2723] file:text-white hover:file:bg-[#2C1D18] cursor-pointer"
                        />
                        {uploadingFile && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                            {isAr ? "جاري رفع الصورة..." : "Uploading image..."}
                          </p>
                        )}
                        {transactionImageUrl && (
                          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {isAr ? "تم رفع الإيصال بنجاح" : "Receipt uploaded successfully"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || uploadingFile}
                  className={`w-full bg-[#2C1D18] hover:bg-[#3E2723] text-white border border-[#C5A059]/40 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting || uploadingFile ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isAr ? "جاري تأكيد الطلب..." : "Processing Order..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">lock</span>
                      <span>{isAr ? "تأكيد الطلب الآن" : "Place Order Now"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
