
export type UserType = 'customer' | 'vendor';

export interface User {
  name: string;
  type: UserType;
  location?: ProductLocation;
}

export type ProductLocation = 'royapuram' | 't.nagar' | 'ashok nagar' | 'saidapetu';

export interface Product {
  id: number;
  name:string;
  category: 'vegetables' | 'dairy' | 'newspapers' | 'chocolates' | 'fruits';
  price: number; // price per unit
  unit: 'kg' | 'L' | 'pcs';
  unitIncrement?: number; // e.g. 0.25 for kg, 0.5 for L, 1 for pcs
  offer?: {
    percentage: number;
    newPrice: number;
  };
  expiryDate: string; // YYYY-MM-DD
  stock: number;
  rating?: {
    average: number;
    count: number;
  };
  location: ProductLocation;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PreOrderItem {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  vendorLocation: ProductLocation;
  status: PreOrderStatus;
}

export type PreOrderStatus = 'pending' | 'accepted' | 'rejected';

export interface FavoriteItem {
  productId: number;
  customerName: string;
}

export interface Location {
    lat: number;
    lng: number;
}

export type OrderStatus = 'Order Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered';
export type PaymentMethod = 'cod' | 'card' | 'upi';
export type UpiMode = 'qr' | 'id';

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    customerName: string;
    customerLocation: Location | null;
    customerAddress: string;
    vendorLocation: Location;
    vendorLocationName: ProductLocation;
    paymentMethod: PaymentMethod;
    upiMode?: UpiMode;
    upiId?: string;
    status: OrderStatus;
    timestamp: Date;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
}