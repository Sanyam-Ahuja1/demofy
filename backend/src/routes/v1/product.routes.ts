import { Router } from 'express';
import { z } from 'zod';
import * as productService from '../../services/product.service';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';
import { successResponse } from '../../utils/response';

const router = Router();

// Validation schema
const listProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    categoryId: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  }),
});

const getProductSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

/**
 * GET /api/v1/products
 * List products with pagination and filters
 */
router.get(
  '/',
  validate(listProductsSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, categoryId, search, minPrice, maxPrice } = req.query;
    const { items, meta } = await productService.listProducts(
      {
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice as unknown as number,
        maxPrice: maxPrice as unknown as number,
      },
      { page: page as unknown as number, limit: limit as unknown as number }
    );
    res.json(successResponse(items, undefined, {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      pages: meta.totalPages
    }));
  })
);

/**
 * GET /api/v1/products/:slug
 * Get product by slug
 */
router.get(
  '/:slug',
  validate(getProductSchema),
  asyncHandler(async (req, res) => {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(successResponse(product));
  })
);

export default router;
