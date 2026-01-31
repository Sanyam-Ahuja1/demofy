'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Image } from '@/ui/primitives/Image';
import { useCart } from '@/core/hooks/useCart';
import { getProducts } from '@/core/data/dataService';
import { formatPrice } from '@/core/lib/formatting';
import type { Product } from '@/core/data/types';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null);

  const total = getTotalPrice(products);

  if (loading) {
    return (
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="h-40 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-neutral-400 mb-4">
            <svg className="w-16 sm:w-20 h-16 sm:h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-neutral-600 mb-6">
            Add some fresh products to get started
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
            Shopping Cart
          </h1>
          <Button variant="ghost" size="sm" onPress={clearCart}>
            <span className="hidden sm:inline">Clear Cart</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {cartProducts.map(({ product, quantity }) => (
            <Card key={product.id} padding="md">
              <div className="flex gap-3 sm:gap-4">
                <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={product.images[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base text-neutral-900 hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-neutral-600 mb-2">
                    {formatPrice(product.price)}
                    {product.unit && ` / ${product.unit}`}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        onPress={() => updateQuantity(product.id, quantity - 1)}
                        variant="outline"
                        size="sm"
                      >
                        −
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        onPress={() => updateQuantity(product.id, quantity + 1)}
                        variant="outline"
                        size="sm"
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      onPress={() => removeItem(product.id)}
                      variant="ghost"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-base sm:text-lg text-neutral-900">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold text-2xl text-primary-600">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Shipping and taxes calculated at checkout
            </p>
            <Link href="/checkout" className="block">
              <Button variant="primary" size="lg" fullWidth>
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" size="md" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
