'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response: any = await api.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setDeleting(id);
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">{categories.length} total categories</p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          ➕ Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.slug}</p>
              </div>
            </div>

            {category.description && (
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <Link
                href={`/dashboard/categories/${category.id}`}
                className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(category.id)}
                disabled={deleting === category.id}
                className="flex-1 text-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                {deleting === category.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No categories found</p>
          <Link
            href="/dashboard/categories/new"
            className="text-green-600 hover:underline mt-2 inline-block"
          >
            Create your first category
          </Link>
        </div>
      )}
    </div>
  );
}
