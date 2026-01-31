// Cart API methods
import { api } from './client';
import { CartItem } from '../data/types';

export const cartApi = {
  // Get user's cart
  async getCart(token: string) {
    return api.request<{ id: string; items: any[] }>('/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add item to cart
  async addToCart(token: string, productId: string, quantity: number) {
    return api.request<{ id: string; items: any[] }>('/cart/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Clear cart
  async clearCart(token: string) {
    return api.request<{ success: boolean }>('/cart', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
