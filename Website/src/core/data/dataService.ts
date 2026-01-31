// Data Service Layer
// This abstraction allows easy swapping from mock JSON to real API calls
// All data fetching should go through these functions

import type { Product, Category } from './types';
import { api } from '../api/client';

/**
 * Fetch all products from backend
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response: any = await api.getProducts();
    const products = response.data || [];
    
    // Transform backend data to match frontend types
    return products.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category?.slug || '',
      images: p.images || [],
      stock: p.stock,
      inStock: p.stock > 0,
      unit: 'kg',
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response: any = await api.getProductBySlug(slug);
    const p = response.data;
    
    if (!p) return null;
    
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category?.slug || '',
      images: p.images || [],
      stock: p.stock,
      inStock: p.stock > 0,
      unit: 'kg',
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    return allProducts.filter((p) => p.category === categorySlug);
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    return [];
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response: any = await api.getCategories();
    const categories = response.data || [];
    
    return categories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || '',
      image: '',
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Fetch single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response: any = await api.getCategoryBySlug(slug);
    const c = response.data;
    
    if (!c) return null;
    
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || '',
      image: '',
    };
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Failed to search products:', error);
    return [];
  }
}
