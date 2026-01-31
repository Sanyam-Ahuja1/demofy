'use client';

// Header Component with Search and Cart

import Link from 'next/link';
import { Input } from '../primitives/Input';
import { Badge } from '../primitives/Badge';
import { useCart } from '@/core/hooks/useCart';
import { useAuth } from '@/core/auth/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const { getTotalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Update totalItems only on client to avoid hydration mismatch
  useEffect(() => {
    setTotalItems(getTotalItems());
  }, [getTotalItems]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (pathname !== '/') {
      if (query) {
        router.push(`/?search=${encodeURIComponent(query)}`);
      } else {
        router.push('/');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between py-3 gap-1 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-display font-bold text-base sm:text-xl md:text-2xl text-primary-600">
                Demofy
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 max-w-xs sm:max-w-md">
            <Input
              type="search"
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search..."
              className="w-full"
            />
          </div>

          {/* Profile/Login Button */}
          <div className="flex-shrink-0">
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-neutral-100 rounded-lg transition-colors"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1 px-1 sm:px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
            aria-label={`Cart with ${totalItems} items`}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700"
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
            {totalItems > 0 && (
              <Badge variant="success" size="sm">
                {totalItems}
              </Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
