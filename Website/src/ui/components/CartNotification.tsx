'use client';

// Cart Notification Toast Component

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../primitives/Button';

export interface CartNotificationProps {
  isVisible: boolean;
  itemCount: number;
  onClose: () => void;
  autoHideDuration?: number;
}

export function CartNotification({ 
  isVisible, 
  itemCount, 
  onClose, 
  autoHideDuration = 3000 
}: CartNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, autoHideDuration, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 min-w-[280px] sm:min-w-[320px]">
        {/* Cart Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-900">
            Added to cart
          </p>
          <p className="text-xs text-neutral-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
          </p>
        </div>

        {/* Go to Cart Button */}
        <Link href="/cart" onClick={onClose}>
          <Button variant="primary" size="sm">
            View Cart
          </Button>
        </Link>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
