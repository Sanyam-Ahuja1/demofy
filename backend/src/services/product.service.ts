import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginationParams,
} from '../utils/pagination';

/**
 * Product Service
 * Handles product queries and operations
 */

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * List products with pagination and filters
 */
export const listProducts = async (
  filters: ProductFilters,
  pagination: PaginationParams
) => {
  const { page, limit, skip } = parsePaginationParams(pagination);

  // Build where clause
  const where: any = {
    isActive: true,
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  // Execute query with pagination
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.product.count({ where }),
  ]);

  return createPaginatedResponse(products, total, page, limit);
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product || !product.isActive) {
    throw new NotFoundError('Product not found');
  }

  return product;
};

/**
 * Get product by ID (admin use)
 */
export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
};
