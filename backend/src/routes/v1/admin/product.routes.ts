import { Router } from 'express';
import { z } from 'zod';
import * as adminService from '../../../services/admin.service';
import { validate } from '../../../middleware/validate';
import { asyncHandler } from '../../../middleware/errorHandler';
import { requireAdmin } from '../../../middleware/auth';
import { successResponse } from '../../../utils/response';

const router = Router();

// All routes require admin authentication
router.use(requireAdmin);

// Validation schemas
const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    images: z.array(z.string().url()).optional(),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().min(1).max(200).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const deleteProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const listProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
  }),
});

/**
 * GET /api/v1/admin/products
 * List all products
 */
router.get(
  '/',
  validate(listProductsSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const result = await adminService.getAllProducts(
      { page: page as unknown as number, limit: limit as unknown as number },
      search as string
    );
    // Transform 'items' to 'data' and 'meta' to 'pagination' to match frontend expectation
    res.json(successResponse(result.items, undefined, {
      total: result.meta.total,
      page: result.meta.page,
      limit: result.meta.limit,
      pages: result.meta.totalPages
    }));
  })
);

/**
 * GET /api/v1/admin/products/:id
 * Get product by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await adminService.getProductById(req.params.id);
    res.json(successResponse(product));
  })
);


/**
 * POST /api/v1/admin/products
 * Create new product
 */
router.post(
  '/',
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await adminService.createProduct(req.body);
    res.status(201).json(successResponse(product));
  })
);

/**
 * PATCH /api/v1/admin/products/:id
 * Update product
 */
router.patch(
  '/:id',
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const product = await adminService.updateProduct(req.params.id, req.body);
    res.json(successResponse(product));
  })
);

/**
 * DELETE /api/v1/admin/products/:id
 * Soft delete product
 */
router.delete(
  '/:id',
  validate(deleteProductSchema),
  asyncHandler(async (req, res) => {
    const product = await adminService.deleteProduct(req.params.id);
    res.json(successResponse(product));
  })
);

export default router;
