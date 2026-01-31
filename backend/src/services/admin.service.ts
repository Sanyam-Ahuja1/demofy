import { prisma } from '../config/database';
import { ValidationError, ConflictError } from '../utils/errors';
import { parsePaginationParams, createPaginatedResponse, PaginationParams } from '../utils/pagination';
import bcrypt from 'bcrypt';

/**
 * Admin Service
 * Handles admin operations for products, categories, and orders
 */

const BCRYPT_ROUNDS = 12;

/**
 * Get all products (admin)
 */
export const getAllProducts = async (
  pagination: PaginationParams,
  search?: string
) => {
  const { page, limit, skip } = parsePaginationParams(pagination);

  const where: any = { isActive: true };
  console.log('getAllProducts where:', JSON.stringify(where));

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

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
 * Get all categories (admin)
 */
export const getAllCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get category by ID (admin)
 */
export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ValidationError('Category not found');
  }

  return category;
};

/**
 * Get product by ID (admin)
 */
export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
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

  if (!product) {
    throw new ValidationError('Product not found');
  }

  return product;
};


/**
 * Create product
 */
export const createProduct = async (data: {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
}) => {
  // Check if slug is unique
  const existing = await prisma.product.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new ConflictError('Product slug already exists');
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new ValidationError('Category not found');
  }

  return prisma.product.create({
    data: {
      ...data,
      images: data.images || [],
    },
  });
};

/**
 * Update product
 */
export const updateProduct = async (
  id: string,
  data: {
    categoryId?: string;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    stock?: number;
    images?: string[];
    isActive?: boolean;
  }
) => {
  // If slug is being updated, check uniqueness
  if (data.slug) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing && existing.id !== id) {
      throw new ConflictError('Product slug already exists');
    }
  }

  // If category is being updated, verify it exists
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ValidationError('Category not found');
    }
  }

  return prisma.product.update({
    where: { id },
    data,
  });
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (id: string) => {
  console.log('Soft deleting product:', id);
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Create category
 */
export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
}) => {
  // Check if slug is unique
  const existing = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new ConflictError('Category slug already exists');
  }

  return prisma.category.create({
    data,
  });
};

/**
 * Update category
 */
export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
  }
) => {
  // If slug is being updated, check uniqueness
  if (data.slug) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing && existing.id !== id) {
      throw new ConflictError('Category slug already exists');
    }
  }

  return prisma.category.update({
    where: { id },
    data,
  });
};

/**
 * Delete category (soft delete)
 */
export const deleteCategory = async (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Create admin user
 */
export const createAdmin = async (email: string, password: string) => {
  // Check if email already exists
  const existing = await prisma.admin.findUnique({
    where: { email },
  });

  if (existing) {
    throw new ConflictError('Admin email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return prisma.admin.create({
    data: {
      email,
      passwordHash,
    },
  });
};
