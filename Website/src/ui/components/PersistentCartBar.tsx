'use client';

// Persistent Cart Bar Component - Always visible when cart has items

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/core/hooks/useCart';

export function PersistentCartBar() {
  const { getTotalItems } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const count = getTotalItems();
    setItemCount(count);
    setIsVisible(count > 0);
  }, [getTotalItems]);

  // Update visibility based on cart changes
  useEffect(() => {
    // Poll for cart changes every 100ms for smooth updates
    const interval = setInterval(() => {
      const count = getTotalItems();
      if (count !== itemCount) {
        setItemCount(count);
        setIsVisible(count > 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [getTotalItems, itemCount]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-primary-600 shadow-lg"
      role="complementary"
      aria-label="Shopping cart summary"
    >
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Cart Info */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="text-white">
              <p className="text-sm sm:text-base font-semibold">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
          </div>

          {/* View Cart Button */}
          <Link href="/cart">
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-primary-600 font-semibold rounded-lg hover:bg-neutral-100 transition-colors text-sm sm:text-base">
              View Cart
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
