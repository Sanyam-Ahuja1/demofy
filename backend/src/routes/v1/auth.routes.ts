import { Router } from 'express';
import { z } from 'zod';
import passport from '../../config/passport';
import * as authService from '../../services/auth.service';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';
import { successResponse } from '../../utils/response';
import { otpRateLimit, authRateLimit } from '../../middleware/rateLimit';
import { requireAuth } from '../../middleware/auth';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';

const router = Router();

// Request validation schemas
const sendOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone number format'),
  }),
});

const verifyOTPSchema = z.object({
  body: z.object({
    phone: z.string(),
    code: z.string().length(6),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const linkPhoneSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone number format'),
    code: z.string().length(6),
  }),
});

/**
 * POST /api/v1/auth/send-otp
 * Send OTP to phone number
 */
router.post(
  '/send-otp',
  otpRateLimit,
  validate(sendOTPSchema),
  asyncHandler(async (req, res) => {
    const { phone } = req.body;
    await authService.sendOTP(phone);
    res.json(successResponse({ message: 'OTP sent successfully' }));
  })
);

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and login/register user
 */
router.post(
  '/verify-otp',
  authRateLimit,
  validate(verifyOTPSchema),
  asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    const tokens = await authService.verifyOTP(phone, code);
    res.json(successResponse(tokens));
  })
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(successResponse(result));
  })
);

/**
 * POST /api/v1/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post(
  '/logout',
  requireAuth,
  validate(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(req.user!.id, refreshToken);
    res.json(successResponse({ message: 'Logged out successfully' }));
  })
);

/**
 * GET /api/v1/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

/**
 * GET /api/v1/auth/google/callback
 * Google OAuth callback - generates JWT and redirects to frontend
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  asyncHandler(async (req, res) => {
    const user = req.user as any;

    // Generate JWT tokens
    const payload = { id: user.id, type: 'user' };
    
    const accessOptions: jwt.SignOptions = { 
      expiresIn: jwtConfig.access.expiresIn as any,
      algorithm: jwtConfig.access.algorithm,
    };
    
    const refreshOptions: jwt.SignOptions = { 
      expiresIn: jwtConfig.refresh.expiresIn as any,
      algorithm: jwtConfig.refresh.algorithm,
    };
    
    const accessToken = jwt.sign(payload, jwtConfig.access.secret, accessOptions);
    const refreshToken = jwt.sign(payload, jwtConfig.refresh.secret, refreshOptions);

    // Store refresh token in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Redirect to frontend with tokens
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  })
);

/**
 * POST /api/v1/auth/link-phone
 * Link phone number to user account (for Google OAuth users)
 */
router.post(
  '/link-phone',
  requireAuth,
  validate(linkPhoneSchema),
  asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    await authService.linkPhoneToUser(req.user!.id, phone, code);
    res.json(successResponse({ message: 'Phone number linked successfully' }));
  })
);

/**
 * POST /api/v1/auth/admin/login
 * Admin login with email/password
 */
router.post(
  '/admin/login',
  authRateLimit,
  validate(adminLoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const tokens = await authService.adminLogin(email, password);
    res.json(successResponse(tokens));
  })
);

export default router;
