// API Client for Backend Communication

import { getApiUrl } from '@/lib/api';

class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use environment-aware URL resolution
    // - Build time: Uses NEXT_PUBLIC_API_URL with full backend URL
    // - Runtime: Uses /api/proxy to avoid CORS
    const url = getApiUrl(endpoint);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Fallback to status text if JSON parse fails
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/${slug}`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.request(`/categories/${slug}`);
  }
}

export const api = new ApiClient();

