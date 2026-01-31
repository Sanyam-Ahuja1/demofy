'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/ui/primitives/Button';
import { Badge } from '@/ui/primitives/Badge';
import { Image } from '@/ui/primitives/Image';
import { useCart } from '@/core/hooks/useCart';
import { getProductBySlug, getProducts } from '@/core/data/dataService';
import { formatPrice } from '@/core/lib/formatting';
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/core/config/metadata';
import { generateBreadcrumbs } from '@/core/config/seo';
import type { Product } from '@/core/data/types';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemQuantity, updateQuantity } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const data = await getProductBySlug(params.slug);
      if (!data) {
        notFound();
      }
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-neutral-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="h-6 bg-neutral-200 rounded w-1/4" />
              <div className="h-20 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const quantity = getItemQuantity(product.id);
  const breadcrumbs = generateBreadcrumbs([
    { name: product.category, href: `/category/${product.category}` },
    { name: product.name, href: `/product/${product.slug}` },
  ]);
  
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-neutral-400">/</span>}
                <Link
                  href={crumb.href}
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <Image
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="error" size="md">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
                {product.unit && (
                  <span className="text-neutral-500">/ {product.unit}</span>
                )}
              </div>

              {product.inStock ? (
                <Badge variant="success">In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <p className="text-neutral-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              {product.inStock ? (
                <>
                  {quantity === 0 ? (
                    <Button
                      onPress={() => addItem(product.id)}
                      variant="primary"
                      size="lg"
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {/* Quantity Controls - Centered */}
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          onPress={() => updateQuantity(product.id, quantity - 1)}
                          variant="outline"
                          size="md"
                          className="w-12"
                        >
                          −
                        </Button>
                        <span className="text-xl font-semibold w-16 text-center">
                          {quantity}
                        </span>
                        <Button
                          onPress={() => updateQuantity(product.id, quantity + 1)}
                          variant="outline"
                          size="md"
                          className="w-12"
                        >
                          +
                        </Button>
                      </div>
                      
                      {/* Go to Cart Button - Separate with spacing */}
                      <Link href="/cart" className="block">
                        <Button variant="primary" size="lg" fullWidth>
                          Go to Cart
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Button variant="outline" size="lg" fullWidth disabled>
                  Out of Stock
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
