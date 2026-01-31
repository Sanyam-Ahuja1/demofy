'use client';

// Cart Management Hook (Platform-Agnostic Business Logic)
// This hook contains NO UI code and can be ported to React Native

import { createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { CartItem, Product } from '../data/types';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalPrice: (products: Product[]) => number;
  onItemAdded?: (callback: () => void) => () => void;
  triggerItemAdded?: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('demofy-cart', []);
  const itemAddedCallbacksRef = useRef<Set<() => void>>(new Set());

  const addItem = useCallback(
    (productId: string, quantity: number = 1) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.productId === productId);
        
        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        
        return [...currentItems, { productId, quantity }];
      });
      
      // Trigger notification callbacks
      itemAddedCallbacksRef.current.forEach(callback => callback());
    },
    [setItems]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [setItems, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.productId === productId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(
    (products: Product[]) => {
      return items.reduce((total, item) => {
        const product = products.find((p) => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
      }, 0);
    },
    [items]
  );

  const onItemAdded = useCallback((callback: () => void) => {
    itemAddedCallbacksRef.current.add(callback);
    return () => {
      itemAddedCallbacksRef.current.delete(callback);
    };
  }, []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      getTotalItems,
      getTotalPrice,
      onItemAdded,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, getTotalItems, getTotalPrice, onItemAdded]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
