'use client';

// Filter Bar Component for Category Selection

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Category } from '@/core/data/types';

export interface FilterBarProps {
  categories: Category[];
  activeCategory?: string;
}

export function FilterBar({ categories, activeCategory }: FilterBarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className="border-b border-neutral-200 bg-white overflow-hidden" aria-label="Category filter">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex overflow-x-auto hide-scrollbar py-2 sm:py-3 gap-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {/* All Products */}
          <Link
            href="/"
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base
              ${!activeCategory && isHomePage
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }
            `}
          >
            All Products
          </Link>

          {/* Category Filters */}
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`
                  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base
                  ${isActive
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }
                `}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
