import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

/**
 * Category Service
 * Handles category operations
 */

/**
 * List all active categories
 */
export const listCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || !category.isActive) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category || !category.isActive) {
    throw new NotFoundError('Category not found');
  }

  return category;
};
