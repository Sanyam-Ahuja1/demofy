// API Client for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear invalid tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `API Error: ${response.status}`);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Products
  async getProducts(page = 1, limit = 20) {
    return this.request(`/admin/products?page=${page}&limit=${limit}`);
  }

  async getProduct(id: string) {
    return this.request(`/admin/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/admin/categories');
  }

  async getCategory(id: string) {
    return this.request(`/admin/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(page = 1, limit = 20) {
    return this.request(`/admin/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: string) {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Storage
  async getUploadUrl(filename: string, contentType: string) {
    return this.request('/admin/storage/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  }
}

export const api = new ApiClient();
