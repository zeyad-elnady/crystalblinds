"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GOVERNORATES, getDeliveryFees, Governorate } from "../lib/deliveryFees";


export interface CartItem {
  id: string; // Unique ID for the cart item (could be timestamp-based or productId+dimensions)
  productId: string;
  labelEn: string;
  labelAr: string;
  image: string;
  price: number; // Total price for this item configuration (per unit)
  quantity: number;
  width?: number;
  height?: number;
  colorName?: string;
  colorHex?: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: (isOpen?: boolean) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  selectedGovernorateId: string | null;
  setGovernorate: (id: string) => void;
  deliveryFee: number;
  isInstallationSelected: boolean;
  setInstallationSelected: (selected: boolean) => void;
  installationFee: number;
  finalTotal: number;
  governorates: Governorate[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string | null>(null);
  const [isInstallationSelected, setInstallationSelected] = useState<boolean>(false);
  const [governorates, setGovernorates] = useState<Governorate[]>(GOVERNORATES);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("crystal_blinds_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    const savedGov = localStorage.getItem("crystal_blinds_governorate");
    if (savedGov) {
      setSelectedGovernorateId(savedGov);
    }
    const savedInstall = localStorage.getItem("crystal_blinds_installation");
    if (savedInstall) {
      setInstallationSelected(savedInstall === "true");
    }
    getDeliveryFees().then(data => setGovernorates(data));
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crystal_blinds_cart", JSON.stringify(items));
      if (selectedGovernorateId) {
        localStorage.setItem("crystal_blinds_governorate", selectedGovernorateId);
      }
      localStorage.setItem("crystal_blinds_installation", String(isInstallationSelected));
    }
  }, [items, selectedGovernorateId, isInstallationSelected, isMounted]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same productId, width, and height exists
      const existingItemIndex = prevItems.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          item.width === newItem.width && 
          item.height === newItem.height
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += newItem.quantity;
        return newItems;
      }

      // Add new item
      return [...prevItems, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleCart = (isOpen?: boolean) => {
    if (isOpen !== undefined) {
      setIsCartOpen(isOpen);
    } else {
      setIsCartOpen((prev) => !prev);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const setGovernorate = (id: string) => {
    setSelectedGovernorateId(id);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const selectedGov = governorates.find(g => g.id === selectedGovernorateId);
  const deliveryFee = selectedGov ? selectedGov.fee : 0;
  const installationFee = isInstallationSelected ? 200 : 0;
  const finalTotal = cartTotal + deliveryFee + installationFee;

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        clearCart,
        cartTotal,
        itemCount,
        selectedGovernorateId,
        setGovernorate,
        deliveryFee,
        isInstallationSelected,
        setInstallationSelected,
        installationFee,
        finalTotal,
        governorates,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
