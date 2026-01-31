/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.BACKEND_HTTP_URL || ''}/:path*`, // Proxy to Backend
      },
    ];
  },
  // next.config.ts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://accounts.google.com;",
              "connect-src 'self' https://maps.googleapis.com https://farmerdairy.vercel.app http://localhost:3000 https://storage.googleapis.com https://accounts.google.com;",
              "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://images.unsplash.com https://storage.googleapis.com https://i.ibb.co https://lh3.googleusercontent.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "frame-src 'self' https://maps.googleapis.com https://accounts.google.com;",
              "worker-src 'self' blob:;" // Required for Google Maps drawing/rendering
            ].join(' '),
          },
        ],
      },
    ];
  }
};

export default nextConfig;
