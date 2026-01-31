import { Router } from 'express';
import * as categoryService from '../../services/category.service';
import { asyncHandler } from '../../middleware/errorHandler';
import { successResponse } from '../../utils/response';

const router = Router();

/**
 * GET /api/v1/categories
 * List all active categories
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await categoryService.listCategories();
    res.json(successResponse(categories));
  })
);

/**
 * GET /api/v1/categories/:id
 * Get category by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(successResponse(category));
  })
);

export default router;
