import { Request } from 'express';
import { User, Admin } from '@prisma/client';

/**
 * Extended Express types for authenticated requests
 */

declare global {
  namespace Express {
    // Extend the built-in properties of the User interface (used by Passport)
    interface User {
      id: string;
      email?: string | null;
      type?: 'user' | 'admin';
    }
    
    // Also extend Request for direct access if needed (optional but good for custom middleware)
    interface Request {
      user?: User;
      admin?: Admin;
    }
  }
}

export {};
