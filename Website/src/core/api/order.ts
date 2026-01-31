// Order API methods
import { api } from './client';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address?: any;
}

export const orderApi = {
  // Create order from cart or direct items
  async createOrder(token: string, addressId: string, items?: { productId: string; quantity: number }[]) {
    return api.request<Order>('/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ addressId, items }),
    });
  },

  // Get user's orders
  async getUserOrders(token: string, page = 1, limit = 10) {
    return api.request<any>(`/orders?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get single order
  async getOrderById(token: string, orderId: string) {
    return api.request<Order>(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
