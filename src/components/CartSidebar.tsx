"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useRef } from "react";

export default function CartSidebar({ isAr }: { isAr: boolean }) {
  const { 
    isCartOpen, toggleCart, items, cartTotal, 
    removeFromCart, updateQuantity,
    selectedGovernorateId, setGovernorate, deliveryFee,
    isInstallationSelected, setInstallationSelected, installationFee,
    finalTotal, governorates
  } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
        // We need to ensure we don't close immediately if they clicked the cart icon
        const headerBtn = document.getElementById("cart-toggle-btn");
        if (headerBtn && headerBtn.contains(event.target as Node)) {
          return;
        }
        toggleCart(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartOpen, toggleCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 bottom-0 ${isAr ? 'left-0' : 'right-0'} w-full md:w-[400px] bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : (isAr ? '-translate-x-full' : 'translate-x-full')} text-[#3E2723]`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#d4af37]">shopping_bag</span>
            <h2 className="text-xl font-bold uppercase tracking-wider">{isAr ? 'سلة التسوق' : 'Your Cart'}</h2>
          </div>
          <button 
            onClick={() => toggleCart(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9F9F9]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-gray-300">shopping_bag</span>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">
                  {isAr ? 'سلة التسوق فارغة.' : 'Your cart is empty.'}
                </p>
                <p className="text-gray-400 text-sm">
                  {isAr ? 'تسوق الآن واختر ما يناسبك!' : 'Grab something fast!'}
                </p>
              </div>
              <button 
                onClick={() => toggleCart(false)}
                className="mt-4 px-8 py-3 bg-[#3E2723] text-white rounded-lg font-medium hover:bg-[#2A1A17] transition-colors shadow-md"
              >
                {isAr ? 'مواصلة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image} alt={isAr ? item.labelAr : item.labelEn} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-[15px] leading-tight">{isAr ? item.labelAr : item.labelEn}</h3>
                        {(item.width && item.height) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.width}cm × {item.height}cm
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-bold text-[#d4af37]">
                        {item.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            
            {/* Governorate Selection */}
            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm font-bold text-gray-700">
                {isAr ? 'اختر المحافظة لمعرفة مصاريف الشحن' : 'Select Governorate for Delivery'}
              </label>
              <select
                value={selectedGovernorateId || ""}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-[#F9F9F9] focus:outline-none focus:border-[#d4af37]"
              >
                <option value="" disabled>
                  {isAr ? '-- اختر المحافظة --' : '-- Select Governorate --'}
                </option>
                {governorates.map(gov => (
                  <option key={gov.id} value={gov.id}>
                    {isAr ? gov.nameAr : gov.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type Selection */}
            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm font-bold text-gray-700">
                {isAr ? 'نوع الخدمة' : 'Service Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInstallationSelected(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    !isInstallationSelected
                      ? "border-[#d4af37] bg-[#d4af37]/10 text-[#3E2723]"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {isAr ? "توصيل فقط" : "Delivery Only"}
                </button>
                <button
                  type="button"
                  onClick={() => setInstallationSelected(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    isInstallationSelected
                      ? "border-[#d4af37] bg-[#d4af37]/10 text-[#3E2723]"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {isAr ? "توصيل وتركيب" : "Delivery & Installation"}
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{cartTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{isAr ? 'مصاريف الشحن' : 'Delivery Fee'}</span>
                <span>
                  {selectedGovernorateId 
                    ? `${deliveryFee.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
                    : (isAr ? 'يحدد لاحقاً' : 'Calculated after selection')}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{isAr ? 'مصاريف التركيب' : 'Installation Fee'}</span>
                <span>
                  {isInstallationSelected 
                    ? `${installationFee.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
                    : (isAr ? 'توصيل فقط' : 'Delivery only')}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold border-t border-gray-100 pt-3">
              <span>{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
              <span>{finalTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>

            <a 
              href={`/${isAr ? 'ar' : 'en'}/contact${selectedGovernorateId ? `?gov=${selectedGovernorateId}&install=${isInstallationSelected}` : ''}`}
              onClick={(e) => {
                if (!selectedGovernorateId) {
                  e.preventDefault();
                  alert(isAr ? 'الرجاء اختيار المحافظة أولاً' : 'Please select a governorate first');
                  return;
                }
                toggleCart(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#d4af37] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-[#c4a133] transition-colors shadow-lg shadow-[#d4af37]/30"
            >
              <span>{isAr ? 'متابعة لطلب معاينة' : 'Proceed to Checkout'}</span>
              <span className="material-symbols-outlined text-[20px]">{isAr ? 'arrow_back' : 'arrow_forward'}</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
