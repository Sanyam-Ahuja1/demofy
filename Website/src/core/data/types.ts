// Core Data Types
// These interfaces define the shape of data used throughout the application
// They match the expected backend API response format for easy swapping later

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  inStock: boolean;
  unit?: string; // e.g., "kg", "piece", "bunch"
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Breadcrumb for navigation
export interface Breadcrumb {
  name: string;
  href: string;
}
