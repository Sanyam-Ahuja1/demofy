'use client';

import { Order } from '@/core/api/order';
import { OrderCard } from './OrderCard';
import Link from 'next/link';
import { Button } from '../primitives/Button';

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
}

export function OrderList({ orders, loading }: OrderListProps) {
  if (loading) {
    return (
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
    );
  }

  if (orders.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
