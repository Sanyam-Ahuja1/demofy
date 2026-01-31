import { Router } from 'express';
import { z } from 'zod';
import * as orderService from '../../../services/order.service';
import { validate } from '../../../middleware/validate';
import { asyncHandler } from '../../../middleware/errorHandler';
import { requireAdmin } from '../../../middleware/auth';
import { successResponse } from '../../../utils/response';

const router = Router();

// All routes require admin authentication
router.use(requireAdmin);

// Validation schemas
const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.string().optional(),
    userId: z.string().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  }),
});

/**
 * GET /api/v1/admin/orders
 * List all orders with filters
 */
router.get(
  '/',
  validate(listOrdersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId } = req.query;
    const { items, meta } = await orderService.getAllOrders(
      { status: status as string | undefined, userId: userId as string | undefined },
      { page: page as unknown as number | undefined, limit: limit as unknown as number | undefined }
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
 * GET /api/v1/admin/orders/:id
 * Get order details
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await orderService.getOrderByIdForAdmin(req.params.id);
    res.json(successResponse(order));
  })
);

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Update order status
 */
router.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(successResponse(order));
  })
);

export default router;
