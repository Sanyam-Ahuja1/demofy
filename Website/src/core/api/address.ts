// Address API methods
import { api } from './client';

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  type: 'home' | 'work' | 'other';
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const addressApi = {
  // Get user's addresses
  async getUserAddresses(token: string) {
    return api.request<Address[]>('/users/me/addresses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Create new address
  async createAddress(token: string, data: CreateAddressData) {
    return api.request<Address>('/users/me/addresses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Update address
  async updateAddress(token: string, addressId: string, data: Partial<CreateAddressData>) {
    return api.request<Address>(`/users/me/addresses/${addressId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete address
  async deleteAddress(token: string, addressId: string) {
    return api.request<{ success: boolean }>(`/users/me/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
