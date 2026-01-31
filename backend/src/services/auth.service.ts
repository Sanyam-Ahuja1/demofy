import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { jwtConfig } from '../config/jwt';
import { env } from '../config/env';
import { getOTPProvider } from './otp.service';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication Service
 * Handles OTP generation, verification, Google OAuth, and JWT token management
 */

const BCRYPT_ROUNDS = 10;

/**
 * Generate a random OTP code
 */
const generateOTP = (): string => {
  const length = env.OTP_LENGTH;
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phone: string): Promise<void> => {
  // Validate phone format (basic validation)
  if (!/^\+\d{10,15}$/.test(phone)) {
    throw new ValidationError('Invalid phone number format. Use international format (+1234567890)');
  }

  // Generate OTP
  const code = generateOTP();
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP in database
  await prisma.oTP.create({
    data: {
      phone,
      codeHash,
      expiresAt,
    },
  });

  // Send OTP via provider
  const otpProvider = getOTPProvider();
  await otpProvider.sendOTP(phone, code);

  logger.info(`OTP sent to ${phone}`);
  
  // In development, also accept a fixed code for easier testing
  if (env.NODE_ENV !== 'production') {
    logger.info('💡 DEV MODE: You can also use OTP code "123456" for any phone number');
  }
};

/**
 * Verify OTP and create/login user
 */
export const verifyOTP = async (
  phone: string,
  code: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // DEVELOPMENT ONLY: Accept fixed OTP code "123456"
  const isDevBypass = env.NODE_ENV !== 'production' && code === '123456';
  
  if (!isDevBypass) {
    // Find most recent unverified OTP for this phone
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    // Verify OTP code
    const isValid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid OTP code');
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
  } else {
    logger.info('🔓 DEV MODE: Using bypass code 123456');
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { 
        phone,
        isPhoneVerified: true, // Phone is verified through OTP (mapped)
      },
    });
    logger.info(`New user created via OTP: ${user.id}`);
  } else {
    // Update phone verification status if not already verified
    if (!user.isPhoneVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true },
      });
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user.id, 'user');

  // Store refresh token
  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

/**
 * Link phone number to Google OAuth user
 * Used during checkout for first-time Google users
 */
export const linkPhoneToUser = async (
  userId: string,
  phone: string,
  code: string
): Promise<void> => {
  // DEVELOPMENT ONLY: Accept fixed OTP code "123456"
  const isDevBypass = env.NODE_ENV !== 'production' && code === '123456';
  
  if (!isDevBypass) {
    // Find most recent unverified OTP for this phone
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    // Verify OTP code
    const isValid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid OTP code');
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
  } else {
    logger.info('🔓 DEV MODE: Using bypass code 123456 for phone linking');
  }

  // Check if phone is already used by another user
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new ValidationError('This phone number is already linked to another account');
  }

  // Update user with verified phone
  await prisma.user.update({
    where: { id: userId },
    data: {
      phone,
      isPhoneVerified: true, // Mapped property
    },
  });

  logger.info(`Phone ${phone} linked to user ${userId}`);
};

/**
 * Check if user needs phone verification for checkout
 */
export const checkPhoneVerificationRequired = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPhoneVerified: true }, // Mapped property
  });

  return !user?.isPhoneVerified;
};

/**
 * Generate JWT access and refresh tokens
 */
const generateTokens = async (
  id: string,
  type: 'user' | 'admin'
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = { id, type };

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

  return { accessToken, refreshToken };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  try {
    // Verify refresh token with algorithm restriction
    const decoded = jwt.verify(
      refreshToken,
      jwtConfig.refresh.secret,
      jwtConfig.refresh.verifyOptions
    ) as {
      id: string;
      type: 'user' | 'admin';
    };

    // Find session with this refresh token
    const sessions = await prisma.authSession.findMany({
      where: {
        userId: decoded.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Check if refresh token matches any session
    let validSession = null;
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new access token
    const accessOptions: jwt.SignOptions = { 
      expiresIn: jwtConfig.access.expiresIn as any,
      algorithm: jwtConfig.access.algorithm,
    };
    const accessToken = jwt.sign(
      { id: decoded.id, type: decoded.type },
      jwtConfig.access.secret,
      accessOptions
    );

    return { accessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Logout user - invalidate refresh token
 */
export const logout = async (userId: string, refreshToken: string): Promise<void> => {
  // Find and delete session
  const sessions = await prisma.authSession.findMany({
    where: { userId },
  });

  for (const session of sessions) {
    const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (isValid) {
      await prisma.authSession.delete({
        where: { id: session.id },
      });
      logger.info(`User ${userId} logged out`);
      return;
    }
  }
};

/**
 * Admin login with email and password
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(admin.id, 'admin');

  logger.info(`Admin ${admin.id} logged in`);

  return { accessToken, refreshToken };
};
