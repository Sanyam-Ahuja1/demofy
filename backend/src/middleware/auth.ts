import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { jwtConfig } from '../config/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * JWT payload interface
 */
interface JwtPayload {
  id: string;
  type: 'user' | 'admin';
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Middleware to authenticate user requests
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token with algorithm restriction
    const decoded = jwt.verify(
      token,
      jwtConfig.access.secret,
      jwtConfig.access.verifyOptions
    ) as JwtPayload;

    if (decoded.type !== 'user') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to authenticate admin requests
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token with algorithm restriction
    const decoded = jwt.verify(
      token,
      jwtConfig.access.secret,
      jwtConfig.access.verifyOptions
    ) as JwtPayload;

    if (decoded.type !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    // Fetch admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      throw new UnauthorizedError('Admin not found');
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};
