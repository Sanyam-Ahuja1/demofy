'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
import { orderApi, Order } from '@/core/api/order';
import { OrderList } from '@/ui/components/OrderList';
import Link from 'next/link';

function OrderHistoryContent() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!accessToken) return;
      
      try {
        const response: any = await orderApi.getUserOrders(accessToken);
        // Handle paginated response structure (response.data contains the array)
        const ordersData = response.data || [];
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
              Your Orders
            </h1>
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base hover:underline"
            >
              Continue Shopping
            </Link>
          </div>

          <OrderList orders={orders} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute>
      <OrderHistoryContent />
    </ProtectedRoute>
  );
}
