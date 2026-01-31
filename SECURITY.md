# Security Best Practices

This document outlines the security measures implemented in the Farmify backend application.

## Authentication & Authorization

### JWT Token Management

**Implementation**: Industry-standard JSON Web Tokens (JWT) for stateless authentication

**Security Features**:

- ✅ **Algorithm Restriction**: All tokens use `HS256` exclusively to prevent algorithm confusion attacks
- ✅ **Token Expiration**: Access tokens expire based on `JWT_ACCESS_EXPIRY` environment variable
- ✅ **Refresh Tokens**: Long-lived refresh tokens (7 days) for session management
- ✅ **Clock Tolerance**: 10-second tolerance for distributed systems
- ✅ **Type Validation**: Tokens include user type (`user` or `admin`) to prevent privilege escalation
- ✅ **Database Validation**: User/admin existence is verified on every request

**Configuration**: See [`src/config/jwt.ts`](file:///home/samito/Downloads/Farmify/backend/src/config/jwt.ts)

**Best Practices Applied**:

```typescript
// Explicit algorithm specification prevents attacks
algorithm: "HS256";

// Verification with algorithm restriction
jwt.verify(token, secret, {
  algorithms: ["HS256"],
  clockTolerance: 10,
});
```

### Password Security

**Implementation**: bcrypt with 10 rounds of hashing

**Features**:

- ✅ **Strong Hashing**: bcrypt with computational cost factor of 10
- ✅ **Salt Integration**: Automatic salt generation per password
- ✅ **Timing Attack Protection**: bcrypt's compare function prevents timing attacks

**Usage**: Admin passwords and refresh token storage

### OTP Security

**Features**:

- ✅ **Secure Generation**: Random 6-digit codes
- ✅ **Hashed Storage**: OTP codes are hashed with bcrypt before storage
- ✅ **Expiration**: Configurable expiry (`OTP_EXPIRY_MINUTES`)
- ✅ **Single Use**: OTPs are marked as verified after successful use
- ✅ **Rate Limiting**: Protected by strict rate limits (3 requests per 15 minutes in production)

**Development Mode**: Fixed bypass code `123456` for easier testing (disabled in production)

---

## Rate Limiting

### Redis-Backed Rate Limiting

**Implementation**: `express-rate-limit` with Redis store for distributed rate limiting

**Configuration**:

| Endpoint Type      | Production   | Development  | Window     |
| ------------------ | ------------ | ------------ | ---------- |
| **OTP Requests**   | 3 requests   | 100 requests | 15 minutes |
| **Auth Endpoints** | 10 requests  | 100 requests | 1 hour     |
| **General API**    | 100 requests | 100 requests | 15 minutes |

**Features**:

- ✅ **Distributed Protection**: Redis store enables rate limiting across multiple server instances
- ✅ **Graceful Degradation**: Falls back to in-memory store if Redis is unavailable
- ✅ **Error Handling**: Explicit error listeners prevent crashes
- ✅ **Reconnection Strategy**: Exponential backoff with max 20 retries

**Configuration**: See [`src/middleware/rateLimit.ts`](file:///home/samito/Downloads/Farmify/backend/src/middleware/rateLimit.ts)

---

## HTTP Security Headers

### Helmet.js Integration

**Implementation**: Helmet middleware for security-related HTTP headers

**Protected Against**:

- ✅ **XSS Attacks**: X-Content-Type-Options header
- ✅ **Clickjacking**: X-Frame-Options header
- ✅ **MIME Sniffing**: X-Content-Type-Options header
- ✅ **DNS Prefetching**: X-DNS-Prefetch-Control header

**Configuration**: Default Helmet settings in [`src/index.ts`](file:///home/samito/Downloads/Farmify/backend/src/index.ts)

---

## CORS Configuration

**Implementation**: Controlled cross-origin resource sharing

**Features**:

- ✅ **Allowlist**: Only configured origins can access the API
- ✅ **Credentials Support**: Enables cookies and authentication headers
- ✅ **Environment-Based**: Configured via `ALLOWED_ORIGINS` environment variable

**Configuration**:

```typescript
cors({
  origin: env.ALLOWED_ORIGINS, // e.g., 'http://localhost:3000,http://localhost:3001'
  credentials: true,
});
```

---

## Database Security

### Prisma ORM

**Implementation**: Type-safe database access with Prisma

**Features**:

- ✅ **SQL Injection Protection**: Parameterized queries prevent SQL injection
- ✅ **Type Safety**: TypeScript types prevent data type errors
- ✅ **Connection Pooling**: Singleton pattern prevents connection exhaustion
- ✅ **Graceful Shutdown**: Proper connection cleanup on server shutdown

**Configuration**: See [`src/config/database.ts`](file:///home/samito/Downloads/Farmify/backend/src/config/database.ts)

---

## Environment Variables

### Required Security Variables

**Critical Secrets** (MUST be unique and strong in production):

```bash
# JWT Secrets (use different values for each!)
JWT_SECRET=<generate-strong-random-string>
JWT_REFRESH_SECRET=<generate-different-strong-random-string>

# JWT Expiration
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/farmify

# Redis (optional, but recommended for production)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Generating Strong Secrets**:

```bash
# Generate a secure random string for JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> [!CAUTION]
> **Never commit `.env` files to version control!** Ensure `.env` is in `.gitignore`

---

## Security Checklist

### Deployment Security

- [ ] **Environment Variables**: All secrets set with strong, unique values
- [ ] **JWT Secrets**: Different secrets for access and refresh tokens
- [ ] **Database Credentials**: Strong password, not shared with development
- [ ] **Redis Connection**: Using TLS if exposed to internet
- [ ] **CORS Origins**: Limited to production domains only
- [ ] **Rate Limiting**: Production values enabled (`NODE_ENV=production`)
- [ ] **HTTPS**: Backend served over HTTPS in production
- [ ] **Helmet**: Enabled and configured
- [ ] **Logging**: Sensitive data NOT logged (passwords, tokens)

### Code Security

- [x] **Password Hashing**: bcrypt with appropriate rounds
- [x] **JWT Algorithm**: Explicit HS256 specification
- [x] **SQL Injection**: Prevented via Prisma ORM
- [x] **Error Handling**: Centralized error handler
- [x] **Input Validation**: Zod schema validation on all inputs
- [x] **Rate Limiting**: Implemented on sensitive endpoints

---

## Incident Response

### Suspected Token Compromise

1. **Immediate**: Invalidate all refresh tokens in database
2. **Short-term**: Rotate JWT secrets (requires all users to re-login)
3. **Long-term**: Investigate logs, implement additional monitoring

### Suspected Data Breach

1. **Immediate**: Take affected services offline
2. **Investigation**: Check database logs, application logs
3. **Notification**: Inform affected users
4. **Recovery**: Restore from clean backup if necessary

---

## Security Contacts

For security vulnerabilities, please contact: [Your security contact]

**Do not** open public GitHub issues for security vulnerabilities.

---

## Regular Security Tasks

### Monthly

- [ ] Review and update dependencies (`npm audit`)
- [ ] Check for database query performance issues
- [ ] Review rate limiting effectiveness in logs

### Quarterly

- [ ] Rotate JWT secrets
- [ ] Review and update CORS allowed origins
- [ ] Penetration testing (if applicable)
- [ ] Security audit of new features

### Annually

- [ ] Full security audit
- [ ] Update security documentation
- [ ] Review and update incident response plan
