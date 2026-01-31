import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/core/data/dataService';
import { FilterBar } from '@/ui/components/FilterBar';
import { ProductGrid } from '@/ui/components/ProductGrid';
import { generateCategoryMetadata } from '@/core/config/metadata';
import { getCanonicalUrl } from '@/core/config/seo';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Force dynamic rendering and disable caching for this page
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return generateCategoryMetadata(category);
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((p) => p.category === category.slug);

  return (
    <>
      <FilterBar categories={categories} activeCategory={category.slug} />
      
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
            {category.name}
          </h1>
          <p className="text-neutral-600">
            {category.description}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <ProductGrid
          products={categoryProducts}
          emptyMessage={`No products available in ${category.name}`}
        />
      </div>
    </>
  );
}
