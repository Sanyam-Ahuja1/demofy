// Dynamic Metadata Generation and JSON-LD Structured Data
import type { Metadata } from 'next';
import { env } from './env';
import { siteConfig } from './seo';
import type { Product, Category } from '../data/types';

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(product: Product): Metadata {
  const price = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(product.price);

  return {
    title: `${product.name} - ${price}`,
    description: product.description,
    keywords: [product.name, product.category, 'organic', 'farm fresh'],
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${env.siteUrl}/product/${product.slug}`,
      type: 'website',
      images: product.images.map((img) => ({
        url: img,
        width: 800,
        height: 600,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images,
    },
    alternates: {
      canonical: `${env.siteUrl}/product/${product.slug}`,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(category: Category): Metadata {
  return {
    title: `${category.name} Products`,
    description: category.description || `Browse our selection of ${category.name.toLowerCase()} products`,
    openGraph: {
      title: `${category.name} Products`,
      description: category.description,
      url: `${env.siteUrl}/category/${category.slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `${env.siteUrl}/category/${category.slug}`,
    },
  };
}

/**
 * Product Schema (JSON-LD)
 */
export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${env.siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
  };
}

/**
 * Breadcrumb Schema (JSON-LD)
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${env.siteUrl}${item.href}`,
    })),
  };
}

/**
 * Organization Schema (JSON-LD)
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: env.siteUrl,
    logo: `${env.siteUrl}/images/logo.png`,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.facebook,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@demofy.com',
    },
  };
}

/**
 * WebSite Schema (JSON-LD) for search functionality
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: env.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${env.siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
