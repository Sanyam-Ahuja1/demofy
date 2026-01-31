// Environment Configuration
// Access environment variables in a type-safe manner

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validate required environment variables
if (typeof window === 'undefined') {
  // Server-side validation only
  if (!env.siteUrl) {
    console.warn('NEXT_PUBLIC_SITE_URL is not set. Using default localhost.');
  }
}
