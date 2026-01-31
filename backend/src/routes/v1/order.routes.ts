import { Router } from 'express';
import { z } from 'zod';
import * as orderService from '../../services/order.service';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';
import { requireAuth } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })).optional(),
  }),
});

const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

const getOrderSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
});

/**
 * POST /api/v1/orders
 * Create order from cart
 */
router.post(
  '/',
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { addressId, items } = req.body;
    const order = await orderService.createOrder(req.user!.id, addressId, items);
    res.status(201).json(successResponse(order));
  })
);

/**
 * GET /api/v1/orders
 * List user's orders
 */
router.get(
  '/',
  validate(listOrdersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { items, meta } = await orderService.getUserOrders(
      req.user!.id,
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
 * GET /api/v1/orders/:orderId
 * Get order details
 */
router.get(
  '/:orderId',
  validate(getOrderSchema),
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId, req.user!.id);
    res.json(successResponse(order));
  })
);

export default router;
