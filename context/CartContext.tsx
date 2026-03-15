import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { type CartItem, type Product } from '../types';

const CART_STORAGE_KEY = 'local-connect-cart-items';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number, productLocation: Product['location']) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!storedItems) return [];
      const parsedItems = JSON.parse(storedItems) as CartItem[];
      return Array.isArray(parsedItems) ? parsedItems : [];
    } catch {
      return [];
    }
  });

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const itemInCart = prevItems.find(
        (item) => item.id === product.id && item.location === product.location
      );
      if (itemInCart) {
        return prevItems.map((item) =>
          item.id === product.id && item.location === product.location
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number, productLocation: Product['location']) => {
    setCartItems((prevItems) => {
      const itemInCart = prevItems.find(
        (item) => item.id === productId && item.location === productLocation
      );
      if (itemInCart && itemInCart.quantity > 1) {
        return prevItems.map((item) =>
          item.id === productId && item.location === productLocation
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevItems.filter(
        (item) => !(item.id === productId && item.location === productLocation)
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.offer ? item.offer.newPrice : item.price;
    return total + price * item.quantity;
  }, 0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write failures (e.g., private mode quota issues).
    }
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
