'use client';

// Homepage - Amazon-style Category Carousels

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterBar } from '@/ui/components/FilterBar';
import { CategoryCarousel } from '@/ui/components/CategoryCarousel';
import { ProductGrid } from '@/ui/components/ProductGrid';
import { getProducts, getCategories } from '@/core/data/dataService';
import type { Product, Category } from '@/core/data/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter products by search query
  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    filteredProducts.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  if (loading) {
    return (
      <>
        <FilterBar categories={[]} />
        <div className="container mx-auto py-8 px-3 sm:px-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6 animate-pulse" />
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex-shrink-0 w-40 sm:w-48">
                      <div className="aspect-square bg-neutral-200 rounded-lg mb-2 animate-pulse" />
                      <div className="h-4 bg-neutral-200 rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FilterBar categories={categories} />
      
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
            {searchQuery ? `Search: "${searchQuery}"` : 'Fresh Organic Products'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {searchQuery
              ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`
              : 'Browse by category'}
          </p>
        </div>

        {/* Search Results - Show Grid */}
        {searchQuery ? (
          <ProductGrid
            products={filteredProducts}
            emptyMessage={`No products found for "${searchQuery}"`}
          />
        ) : (
          /* Category Carousels - Amazon Style */
          <div className="space-y-6 sm:space-y-8">
            {categories.map((category) => {
              const categoryProducts = productsByCategory[category.slug] || [];
              return (
                <CategoryCarousel
                  key={category.id}
                  title={category.name}
                  products={categoryProducts}
                  categorySlug={category.slug}
                />
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-600 text-lg">No products available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <>
        <FilterBar categories={[]} />
        <div className="container mx-auto py-8 px-3 sm:px-6">
           <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6 animate-pulse" />
           {/* Skeleton content */}
        </div>
      </>
    }>
      <HomeContent />
    </Suspense>
  );
}
