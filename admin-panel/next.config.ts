import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
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
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.BACKEND_HTTP_URL || 'http://localhost:3000/api/v1'}/:path*`, 
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com;",
              "connect-src 'self' https://maps.googleapis.com https://farmerdairy.vercel.app http://localhost:3000 https://storage.googleapis.com;",
              "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://images.unsplash.com https://storage.googleapis.com https://i.ibb.co;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "frame-src 'self' https://maps.googleapis.com;",
              "worker-src 'self' blob:;" // Required for Google Maps drawing/rendering
            ].join(' '),
          },
        ],
      },
    ];
  }
};

export default nextConfig;

