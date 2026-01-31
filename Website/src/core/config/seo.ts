// SEO Configuration and Utilities
import { env } from './env';
import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Demofy',
  description: 'The premier platform for demonstrating your projects. Showcase your work with style and ease.',
  url: env.siteUrl,
  ogImage: `${env.siteUrl}/images/og-image.jpg`,
  links: {
    twitter: 'https://twitter.com/demofy',
    facebook: 'https://facebook.com/demofy',
  },
} as const;

export const defaultMetadata: Metadata = {
  title: {
    default: 'Demofy - Details Matter',
    template: '%s | Demofy',
  },
  description: siteConfig.description,
  keywords: [
    'demo',
    'showcase',
    'portfolio',
    'web app',
    'projects',
  ],
  authors: [{ name: 'Demofy' }],
  creator: 'Demofy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@demofy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/**
 * Generate canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${env.siteUrl}${cleanPath}`;
}

/**
 * Generate breadcrumb trail
 */
export function generateBreadcrumbs(segments: Array<{ name: string; href: string }>) {
  return [
    { name: 'Home', href: '/' },
    ...segments,
  ];
}
