'use client';

import { Order } from '@/core/api/order';
import { Badge } from '../primitives/Badge';
import Image from 'next/image';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-b border-neutral-100">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Order Placed
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            ₹{Number(order.total).toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Order #
          </span>
          <span className="text-sm font-mono text-neutral-600 truncate max-w-[150px]" title={order.id}>
            {order.id.slice(-8).toUpperCase()}
          </span>
        </div>
        <div className="sm:ml-auto">
          <Badge variant={getStatusVariant(order.status) as any}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-900 truncate">
                  {item.product?.name || 'Product Unavailable'}
                </h4>
                <p className="text-sm text-neutral-500 mt-1">
                  Qty: {item.quantity} × ₹{item.priceAtPurchase}
                </p>
                {/* Could add 'Buy it again' button here in future */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
