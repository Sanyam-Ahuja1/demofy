'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/AuthContext';
import { ProfileLayout } from '@/ui/components/ProfileLayout';
import { orderApi, Order } from '@/core/api/order';
import { OrderCard } from '@/ui/components/OrderCard';
import { Button } from '@/ui/primitives/Button';
import Link from 'next/link';

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response: any = await orderApi.getUserOrders(accessToken!);
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">My Orders</h2>
          <p className="text-neutral-600">
            View and track your order history
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
                <div className="h-6 bg-neutral-100 rounded w-1/4 mb-4" />
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-100 rounded w-3/4" />
                      <div className="h-4 bg-neutral-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 shadow-sm px-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No orders yet</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
              Start shopping to fill your kitchen with fresh, organic products directly from farmers.
            </p>
            <Link href="/">
              <Button variant="primary" size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
