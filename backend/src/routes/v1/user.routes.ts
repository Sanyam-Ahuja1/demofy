import { Router } from 'express';
import { z } from 'zod';
import * as userService from '../../services/user.service';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';
import { requireAuth } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Validation schemas
const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  }),
});

const addAddressSchema = z.object({
  body: z.object({
    type: z.enum(['home', 'work', 'other']),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    country: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressSchema = z.object({
  params: z.object({
    addressId: z.string(),
  }),
  body: z.object({
    type: z.enum(['home', 'work', 'other']).optional(),
    line1: z.string().min(1).optional(),
    line2: z.string().optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
    country: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isDefault: z.boolean().optional(),
  }),
});

const deleteAddressSchema = z.object({
  params: z.object({
    addressId: z.string(),
  }),
});

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json(successResponse(req.user));
  })
);

/**
 * PATCH /api/v1/users/me
 * Update current user profile
 */
router.patch(
  '/me',
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.user!.id, req.body);
    res.json(successResponse(user));
  })
);

/**
 * GET /api/v1/users/me/addresses
 * Get user addresses
 */
router.get(
  '/me/addresses',
  asyncHandler(async (req, res) => {
    const addresses = await userService.getUserAddresses(req.user!.id);
    res.json(successResponse(addresses));
  })
);

/**
 * POST /api/v1/users/me/addresses
 * Add new address
 */
router.post(
  '/me/addresses',
  validate(addAddressSchema),
  asyncHandler(async (req, res) => {
    const address = await userService.addUserAddress(req.user!.id, req.body);
    res.json(successResponse(address));
  })
);

/**
 * PATCH /api/v1/users/me/addresses/:addressId
 * Update existing address
 */
router.patch(
  '/me/addresses/:addressId',
  validate(updateAddressSchema),
  asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const address = await userService.updateUserAddress(addressId, req.user!.id, req.body);
    res.json(successResponse(address));
  })
);

/**
 * DELETE /api/v1/users/me/addresses/:addressId
 * Delete address
 */
router.delete(
  '/me/addresses/:addressId',
  validate(deleteAddressSchema),
  asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const result = await userService.deleteUserAddress(addressId, req.user!.id);
    res.json(successResponse(result));
  })
);

/**
 * DELETE /api/v1/users/me
 * Delete user account and all related data
 */
router.delete(
  '/me',
  asyncHandler(async (req, res) => {
    const result = await userService.deleteUserAccount(req.user!.id);
    res.json(successResponse(result));
  })
);

export default router;
