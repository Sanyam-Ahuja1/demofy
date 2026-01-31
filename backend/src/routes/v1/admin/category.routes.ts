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
const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

/**
 * GET /api/v1/admin/categories
 * List all categories
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await adminService.getAllCategories();
    res.json(successResponse(categories));
  })
);

/**
 * GET /api/v1/admin/categories/:id
 * Get category by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await adminService.getCategoryById(req.params.id);
    res.json(successResponse(category));
  })
);


/**
 * POST /api/v1/admin/categories
 * Create new category
 */
router.post(
  '/',
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    const category = await adminService.createCategory(req.body);
    res.status(201).json(successResponse(category));
  })
);

/**
 * PATCH /api/v1/admin/categories/:id
 * Update category
 */
router.patch(
  '/:id',
  validate(updateCategorySchema),
  asyncHandler(async (req, res) => {
    const category = await adminService.updateCategory(req.params.id, req.body);
    res.json(successResponse(category));
  })
);

/**
 * DELETE /api/v1/admin/categories/:id
 * Soft delete category
 */
router.delete(
  '/:id',
  validate(deleteCategorySchema),
  asyncHandler(async (req, res) => {
    const category = await adminService.deleteCategory(req.params.id);
    res.json(successResponse(category));
  })
);

export default router;
