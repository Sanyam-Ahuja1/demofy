import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Suspense } from 'react';
import { CartProvider } from '@/core/hooks/useCart';
import { AuthProvider } from '@/core/auth/AuthContext';
import { Header } from '@/ui/components/Header';
import { Footer } from '@/ui/components/Footer';
import { PersistentCartBar } from '@/ui/components/PersistentCartBar';
import { defaultMetadata, siteConfig } from '@/core/config/seo';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/core/config/metadata';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-16 bg-white border-b" />}>
              <Header />
            </Suspense>
            <main className="flex-1 pb-20">{children}</main>
            <Footer />
            <PersistentCartBar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
