import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_PRODUCTS } from '../data/products';
import { type Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  resetProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_STORAGE_KEY = 'local-connect-products';

const VALID_CATEGORIES: Product['category'][] = ['vegetables', 'fruits', 'dairy', 'chocolates', 'newspapers'];

const ensureValidCategory = (category: Product['category']): Product['category'] => {
  return VALID_CATEGORIES.includes(category) ? category : 'vegetables';
};

const getDefaultProducts = (): Product[] => {
  return MOCK_PRODUCTS.map(product => ({ ...product, category: ensureValidCategory(product.category) }));
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!storedProducts) {
        return getDefaultProducts();
      }

      const parsedProducts = JSON.parse(storedProducts) as Product[];
      return Array.isArray(parsedProducts)
        ? parsedProducts.map(product => ({ ...product, category: ensureValidCategory(product.category) }))
        : getDefaultProducts();
    } catch {
      return getDefaultProducts();
    }
  });

  useEffect(() => {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [
      {
        ...product,
        id: Date.now(),
        category: ensureValidCategory(product.category),
      },
      ...prev,
    ]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(existing => (
      existing.id === product.id
        ? { ...product, category: ensureValidCategory(product.category) }
        : existing
    )));
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const resetProducts = () => {
    setProducts(getDefaultProducts());
  };

  const value = useMemo(() => ({ products, addProduct, updateProduct, deleteProduct, resetProducts }), [products]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
