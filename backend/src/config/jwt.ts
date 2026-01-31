import { env } from './env';
import { Algorithm } from 'jsonwebtoken';

/**
 * JWT Configuration
 * Following Context7 MCP best practices for JWT security
 */

// Algorithm to use for JWT signing and verification
// HS256 is secure for server-to-server communication with proper secret management
const JWT_ALGORITHM: Algorithm = 'HS256';

export const jwtConfig = {
  access: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRY,
    algorithm: JWT_ALGORITHM,
    // Verification options
    verifyOptions: {
      algorithms: [JWT_ALGORITHM], // Restrict to specific algorithm to prevent confusion attacks
      clockTolerance: 10, // 10 seconds tolerance for clock differences in distributed systems
    },
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRY,
    algorithm: JWT_ALGORITHM,
    // Verification options
    verifyOptions: {
      algorithms: [JWT_ALGORITHM],
      clockTolerance: 10,
    },
  },
};
