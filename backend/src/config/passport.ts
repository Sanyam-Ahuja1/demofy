import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { env } from './env';
import { prisma } from './database';
import { logger } from '../utils/logger';

/**
 * Configure Passport with Google OAuth 2.0 Strategy
 * This handles authentication via Google accounts
 */

export function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET || '', // Should be in env, handling strict TS
        callbackURL: env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          // Extract Google profile information
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          // Check if user already exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId },
          });

          if (user) {
            // User exists, return it
            logger.info(`Google OAuth: Existing user logged in: ${user.id}`);
            return done(null, user);
          }

          // Check if user exists with this email (account linking scenario)
          if (email) {
            const existingUser = await prisma.user.findUnique({
              where: { email },
            });

            if (existingUser) {
              // Link Google account to existing user
              user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  googleId,
                  name: name || existingUser.name,
                },
              });
              logger.info(`Google OAuth: Linked Google account to existing user: ${user.id}`);
              return done(null, user);
            }
          }

          // Create new user with Google account
          user = await prisma.user.create({
            data: {
              googleId,
              email,
              name,
              isPhoneVerified: false, // Map old 'phoneVerified' to 'isPhoneVerified'
            },
          });

          logger.info(`Google OAuth: New user created: ${user.id}`);
          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error as Error);
        }
      }
    )
  );

  // Passport serialization (not used with JWT, but required by Passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export default passport;
