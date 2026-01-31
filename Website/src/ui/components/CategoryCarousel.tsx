// Category Carousel Component (Amazon-style horizontal scroll)

import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product } from '@/core/data/types';

export interface CategoryCarouselProps {
  title: string;
  products: Product[];
  categorySlug?: string;
}

export function CategoryCarousel({ title, products, categorySlug }: CategoryCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
          {title}
        </h2>
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            See all →
          </Link>
        )}
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative -mx-3 sm:mx-0">
        <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 px-3 sm:px-0 pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-40 sm:w-48 md:w-56"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
