"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function CartSidebar({ isAr }: { isAr: boolean }) {
  const { 
    isCartOpen, toggleCart, items, cartTotal, 
    removeFromCart, updateQuantity
  } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#3E2723]">shopping_bag</span>
            <h2 className="text-base font-bold uppercase tracking-wider">{isAr ? 'سلة التسوق' : 'Your Cart'}</h2>
          </div>
          <button 
            onClick={() => toggleCart(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 bg-[#F9F9F9]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-3xl text-gray-300">shopping_bag</span>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm font-medium">
                  {isAr ? 'سلة التسوق فارغة.' : 'Your cart is empty.'}
                </p>
                <p className="text-gray-400 text-xs">
                  {isAr ? 'تسوق الآن واختر ما يناسبك!' : 'Grab something fast!'}
                </p>
              </div>
              <button 
                onClick={() => toggleCart(false)}
                className="mt-2 px-6 py-2 bg-[#3E2723] text-white text-xs rounded-lg font-medium hover:bg-[#2A1A17] transition-colors shadow-md"
              >
                {isAr ? 'مواصلة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <img src={item.image} alt={isAr ? item.labelAr : item.labelEn} className="w-full h-full object-cover" />
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-[#3E2723] truncate">{isAr ? item.labelAr : item.labelEn}</h3>
                        {item.width && item.height ? (
                          <p className="text-[10px] text-gray-500 mt-0.5" dir="ltr">
                            {item.width}cm × {item.height}cm
                          </p>
                        ) : null}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      {/* Stepper */}
                      <div className="flex items-center bg-gray-100 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-md text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-md text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      {/* Price */}
                      <div className="font-bold text-xs text-[#3E2723]">
                        {(item.price * item.quantity).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
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
          <div className="border-t border-gray-100 p-4 bg-white space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-sm font-bold pt-2">
              <span>{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
              <span>{cartTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>

            <Link 
              href={`/${isAr ? 'ar' : 'en'}/checkout`}
              onClick={() => toggleCart(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#2C1D18] hover:bg-[#3E2723] text-white border border-[#C5A059]/40 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-md"
            >
              <span>{isAr ? 'متابعة لطلب الشراء' : 'Proceed to Checkout'}</span>
              <span className="material-symbols-outlined text-[18px]">{isAr ? 'arrow_back' : 'arrow_forward'}</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
