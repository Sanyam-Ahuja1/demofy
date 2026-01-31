'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes]: any = await Promise.all([
        api.getProducts(1, 1),
        api.getCategories(),
        api.getOrders(1, 1),
      ]);

      setStats({
        products: productsRes.pagination?.total || 0,
        categories: categoriesRes.data?.length || 0,
        orders: ordersRes.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: '📦', href: '/dashboard/products', color: 'blue' },
    { label: 'Categories', value: stats.categories, icon: '🏷️', href: '/dashboard/categories', color: 'purple' },
    { label: 'Total Orders', value: stats.orders, icon: '🛒', href: '/dashboard/orders', color: 'green' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your Farmer-Dairy admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/products/new"
              className="block px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
            >
              ➕ Add New Product
            </Link>
            <Link
              href="/dashboard/categories/new"
              className="block px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium"
            >
              ➕ Add New Category
            </Link>
            <Link
              href="/dashboard/orders"
              className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              📋 View All Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Backend API:</span>
              <span className="font-medium text-green-600">Connected ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="font-medium text-green-600">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
