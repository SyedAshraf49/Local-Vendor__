import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { type PreOrderItem, type PreOrderStatus, type ProductLocation } from '../types';

interface PreOrderContextType {
  preOrderItems: PreOrderItem[];
  addPreOrderItem: (productId: number, productName: string, customerName: string, vendorLocation: ProductLocation) => void;
  removePreOrderItem: (productId: number, customerName: string) => void;
  isPreOrdered: (productId: number, customerName: string) => boolean;
  updatePreOrderStatus: (preOrderId: number, status: PreOrderStatus) => void;
}

const PreOrderContext = createContext<PreOrderContextType | undefined>(undefined);

export const PreOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);

  const addPreOrderItem = useCallback((productId: number, productName: string, customerName: string, vendorLocation: ProductLocation) => {
    setPreOrderItems((prevItems) => {
      const exists = prevItems.some(item => item.productId === productId && item.customerName === customerName);
      if (!exists) {
        const newItem: PreOrderItem = {
          id: Date.now(),
          productId,
          productName,
          customerName,
          vendorLocation,
          status: 'pending',
        };
        return [...prevItems, newItem];
      }
      return prevItems;
    });
  }, []);

  const removePreOrderItem = useCallback((productId: number, customerName: string) => {
    setPreOrderItems((prevItems) => prevItems.filter((item) => !(item.productId === productId && item.customerName === customerName)));
  }, []);

  const isPreOrdered = useCallback((productId: number, customerName: string) => {
      return preOrderItems.some(item => item.productId === productId && item.customerName === customerName);
  }, [preOrderItems]);

  const updatePreOrderStatus = useCallback((preOrderId: number, status: PreOrderStatus) => {
    setPreOrderItems(prevItems => prevItems.map(item => (
      item.id === preOrderId ? { ...item, status } : item
    )));
  }, []);

  return (
    <PreOrderContext.Provider value={{ preOrderItems, addPreOrderItem, removePreOrderItem, isPreOrdered, updatePreOrderStatus }}>
      {children}
    </PreOrderContext.Provider>
  );
};

export const usePreOrder = (): PreOrderContextType => {
  const context = useContext(PreOrderContext);
  if (!context) {
    throw new Error('usePreOrder must be used within a PreOrderProvider');
  }
  return context;
};
