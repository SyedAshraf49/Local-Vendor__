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
const PRODUCTS_STORAGE_VERSION = 3;

const VALID_CATEGORIES: Product['category'][] = ['vegetables', 'fruits', 'dairy', 'chocolates', 'newspapers'];

interface StoredProductsPayload {
  version: number;
  products: Product[];
}

const ensureValidCategory = (category: Product['category']): Product['category'] => {
  return VALID_CATEGORIES.includes(category) ? category : 'vegetables';
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  category: ensureValidCategory(product.category),
});

const getDefaultProducts = (): Product[] => {
  return MOCK_PRODUCTS.map(normalizeProduct);
};

const parseDateOnly = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);

  if ([year, month, day].every(Number.isFinite)) {
    return new Date(year, month - 1, day);
  }

  const parsedDate = new Date(value);
  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
};

const isExpiredDate = (value: string): boolean => {
  const expiryDate = parseDateOnly(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiryDate < today;
};

const shouldRefreshSeededExpiry = (storedProduct: Product, defaultProduct: Product): boolean => {
  return isExpiredDate(storedProduct.expiryDate)
    || parseDateOnly(storedProduct.expiryDate) < parseDateOnly(defaultProduct.expiryDate);
};

const reconcileStoredProducts = (storedProducts: Product[]): Product[] => {
  const defaultProducts = getDefaultProducts();
  const defaultProductsById = new Map(defaultProducts.map(product => [product.id, product]));

  const reconciledProducts = storedProducts.map(product => {
    const normalizedProduct = normalizeProduct(product);
    const defaultProduct = defaultProductsById.get(normalizedProduct.id);

    if (!defaultProduct) {
      return normalizedProduct;
    }

    return shouldRefreshSeededExpiry(normalizedProduct, defaultProduct)
      ? { ...normalizedProduct, expiryDate: defaultProduct.expiryDate }
      : normalizedProduct;
  });

  const storedIds = new Set(reconciledProducts.map(product => product.id));
  const missingDefaultProducts = defaultProducts.filter(product => !storedIds.has(product.id));

  return [...reconciledProducts, ...missingDefaultProducts];
};

const mergeLegacyProducts = (storedProducts: Product[]): Product[] => {
  return reconcileStoredProducts(storedProducts);
};

const isStoredProductsPayload = (value: unknown): value is StoredProductsPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<StoredProductsPayload>;
  return typeof payload.version === 'number' && Array.isArray(payload.products);
};

const areProductsEqual = (left: Product[], right: Product[]): boolean => {
  return JSON.stringify(left) === JSON.stringify(right);
};

const loadProducts = (): Product[] => {
  try {
    const storedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!storedProducts) {
      return getDefaultProducts();
    }

    const parsedProducts = JSON.parse(storedProducts) as unknown;

    if (Array.isArray(parsedProducts)) {
      return reconcileStoredProducts(parsedProducts as Product[]);
    }

    if (isStoredProductsPayload(parsedProducts)) {
      return reconcileStoredProducts(parsedProducts.products);
    }

    return getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    setProducts(prevProducts => {
      const reconciledProducts = reconcileStoredProducts(prevProducts);
      return areProductsEqual(prevProducts, reconciledProducts) ? prevProducts : reconciledProducts;
    });
  }, [products]);

  useEffect(() => {
    const payload: StoredProductsPayload = {
      version: PRODUCTS_STORAGE_VERSION,
      products,
    };

    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(payload));
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
