'use client';

// Search Hook (Platform-Agnostic Business Logic)

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '../data/types';

export function useSearch(products: Product[], initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return products;
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
  }, [products, debouncedQuery]);

  return {
    query,
    setQuery,
    filteredProducts,
    isSearching: query !== debouncedQuery,
  };
}
