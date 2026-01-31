'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/auth/AuthContext';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/profile/orders', label: 'My Orders' },
    { href: '/profile/addresses', label: 'My Addresses' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Account</h1>
          <p className="text-neutral-600">
            {user?.name || user?.phone || 'Manage your account'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="bg-white rounded-lg border border-neutral-200 p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-neutral-200 my-4"></div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full block px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                Logout
              </button>

              {/* Delete Account Link */}
              <Link
                href="/deleteAcc"
                className="block px-4 py-3 rounded-lg text-neutral-500 hover:bg-neutral-50 transition-colors text-sm"
              >
                Delete Account
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
