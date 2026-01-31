// Auth API methods for user authentication

import { api } from './client';

export const authApi = {
  // Request OTP for login/signup
  async requestOTP(phone: string) {
    return api.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // Verify OTP and login
  async verifyOTP(phone: string, otp: string) {
    return api.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code: otp }),
    });
  },

  // Login with Google
  async googleLogin(idToken: string) {
    return api.request('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  // Refresh access token
  async refreshToken(refreshToken: string) {
    return api.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Get user profile
  async getProfile(token: string) {
    return api.request('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Update user profile
  async updateProfile(token: string, data: { name?: string; email?: string }) {
    return api.request('/users/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete user account
  async deleteAccount(token: string) {
    return api.request('/users/me', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
