'use client';

// Product Card Component (Composes Primitives)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Image } from '../primitives/Image';
import { formatPrice } from '@/core/lib/formatting';
import { useCart } from '@/core/hooks/useCart';
import type { Product } from '@/core/data/types';

export interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addItem(product.id);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <>
      <Card className={`group h-full flex flex-col ${compact ? 'p-2' : ''}`} padding={compact ? 'none' : 'md'}>
        <Link href={`/product/${product.slug}`} className="block">
          <div className={`relative ${compact ? 'aspect-square' : 'aspect-square'} overflow-hidden rounded-lg bg-neutral-100 mb-2`}>
            <Image
              src={product.images[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="error" size="sm">Out of Stock</Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 px-1">
            <h3 className={`font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors ${compact ? 'text-sm line-clamp-2 mb-1' : 'line-clamp-2 mb-1'}`}>
              {product.name}
            </h3>
            
            {!compact && (
              <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                {product.description}
              </p>
            )}
            
            <div className={`flex items-baseline gap-1 ${compact ? 'mb-2' : 'mb-3'}`}>
              <span className={`font-bold text-primary-600 ${compact ? 'text-base' : 'text-lg'}`}>
                {formatPrice(product.price)}
              </span>
              {product.unit && (
                <span className="text-xs text-neutral-500">/ {product.unit}</span>
              )}
            </div>
          </div>
        </Link>

        {compact ? (
          // Compact mode: Show +/- controls after first add
          <div className="px-1">
            {product.inStock ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2 justify-center bg-neutral-100 rounded-lg py-1.5 px-2">
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-neutral-200 transition-colors text-neutral-700 font-bold border border-neutral-300"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold w-6 text-center text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-neutral-200 transition-colors text-neutral-700 font-bold border border-neutral-300"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <Button
                  onPress={handleAddToCart}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  Add
                </Button>
              )
            ) : (
              <Button variant="outline" size="sm" fullWidth disabled>
                Out
              </Button>
            )}
          </div>
        ) : (
          // Full mode: Original layout with badge
          <div className="flex items-center gap-2 mt-auto">
            {product.inStock ? (
              <>
                <Button
                  onPress={handleAddToCart}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Add to Cart
                </Button>
                {quantity > 0 && (
                  <Badge variant="success" size="md">
                    {quantity} in cart
                  </Badge>
                )}
              </>
            ) : (
              <Button variant="outline" size="md" fullWidth disabled>
                Out of Stock
              </Button>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
