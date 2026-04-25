"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  quantity: number;
  imageUrl?: string | null;
  size?: string;
  cartItemId?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initial load
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem('moda-mastou-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('moda-mastou-cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (product: CartItem) => {
    const cId = product.cartItemId || `${product.id}-${product.size || 'default'}`;
    const pWithCid = { ...product, cartItemId: cId };

    setCart((prev) => {
      const existing = prev.find(item => item.cartItemId === cId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cId ? { ...item, quantity: item.quantity + product.quantity } : item
        );
      }
      return [...prev, pWithCid];
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
