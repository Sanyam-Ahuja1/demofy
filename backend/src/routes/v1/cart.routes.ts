import { Router } from 'express';
import { z } from 'zod';
import * as cartService from '../../services/cart.service';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';
import { requireAuth } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const addToCartSchema = z.object({
  body: z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).default(1),
  }),
});

const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string(),
  }),
  body: z.object({
    quantity: z.number().int().min(1),
  }),
});

const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z.string(),
  }),
});

/**
 * GET /api/v1/cart
 * Get user's cart
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user!.id);
    res.json(successResponse(cart));
  })
);

/**
 * POST /api/v1/cart/items
 * Add item to cart
 */
router.post(
  '/items',
  validate(addToCartSchema),
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!.id, productId, quantity);
    res.json(successResponse(cart));
  })
);

/**
 * PATCH /api/v1/cart/items/:itemId
 * Update cart item quantity
 */
router.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user!.id, itemId, quantity);
    res.json(successResponse(cart));
  })
);

/**
 * DELETE /api/v1/cart/items/:itemId
 * Remove item from cart
 */
router.delete(
  '/items/:itemId',
  validate(removeCartItemSchema),
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user!.id, itemId);
    res.json(successResponse(cart));
  })
);

/**
 * DELETE /api/v1/cart
 * Clear cart
 */
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await cartService.clearCart(req.user!.id);
    res.json(successResponse(cart));
  })
);

export default router;
