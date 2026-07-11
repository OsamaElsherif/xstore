'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Offer, computeDiscountedPrice } from '@/types';

export interface CartItem extends Product {
  quantity: number;
  active_offer: Offer | null;
  effectivePrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, offer?: Offer | null) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const migrated = parsed.map((item: any) => ({
          ...item,
          active_offer: item.active_offer !== undefined ? item.active_offer : null,
          effectivePrice: item.effectivePrice !== undefined ? item.effectivePrice : item.price,
        }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(migrated);
      } catch (error) {
        console.error('Failed to parse cart from local storage', error);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, offer?: Offer | null) => {
    const activeOffer = offer !== undefined ? offer : ((product as any).active_offer || null);
    const effectivePrice = computeDiscountedPrice(product.price, activeOffer);

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, active_offer: activeOffer, effectivePrice }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, active_offer: activeOffer, effectivePrice }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.effectivePrice ?? item.price) * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
