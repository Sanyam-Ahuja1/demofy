// API Types matching backend schema

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  addressId: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
  };
  items?: OrderItem[];
  address?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  priceAtPurchase: number;
  product?: Product;
}

export interface Address {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  line1: string; // Changed from addressLine1 to line1 to match backend/frontend consistency
  line2?: string | null; // Changed from addressLine2
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
