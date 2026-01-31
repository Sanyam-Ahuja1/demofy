import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable schema with validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  BASE_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Google Auth
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().optional(), // Make optional to avoid immediate crash if missing, but code handles it
  GOOGLE_CALLBACK_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',')),

  // Rate Limiting (Optional)
  REDIS_URL: z.string().optional(),

  // OTP
  OTP_EXPIRY_MINUTES: z.string().transform(Number).default('15'),
  OTP_LENGTH: z.string().transform(Number).default('6'),
  OTP_PROVIDER: z.enum(['console', 'twilio', 'aws-sns']).default('console'),

  // Twilio (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AWS SNS (Optional)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),



  // Storage
  STORAGE_BUCKET_URL: z.string().url().optional(),
  GCS_BUCKET_NAME: z.string().optional(),
  GCP_CREDENTIALS: z.string().optional(), // JSON string for Service Account Key

  // Admin
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
