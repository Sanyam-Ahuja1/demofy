# Dependencies Documentation

This document provides an overview of the dependency strategy for the Farmify e-commerce platform.

## Project Structure

The Farmify platform consists of three main components:

```
Farmify/
├── backend/          # Node.js + Express + Prisma API
├── Website/          # Next.js 14 customer-facing app
└── admin-panel/      # Next.js 16 administration app
```

---

## Backend Dependencies

**Runtime**: Node.js ≥ 20.0.0  
**Package Manager**: npm  
**Status**: ✅ Production-ready

### Core Dependencies

| Package              | Version | Purpose            | Notes                     |
| -------------------- | ------- | ------------------ | ------------------------- |
| `express`            | 4.18.2  | Web framework      | Mature, stable            |
| `@prisma/client`     | 5.9.1   | ORM                | PostgreSQL integration    |
| `jsonwebtoken`       | 9.0.2   | Authentication     | JWT implementation        |
| `bcrypt`             | 5.1.1   | Password hashing   | Native C++ bindings       |
| `helmet`             | 7.1.0   | Security headers   | Essential security        |
| `cors`               | 2.8.5   | CORS handling      | Simple, effective         |
| `express-rate-limit` | 7.1.5   | Rate limiting      | DDoS protection           |
| `rate-limit-redis`   | 4.2.0   | Redis store        | Distributed rate limiting |
| `redis`              | 4.6.12  | Redis client       | Modern async client       |
| `zod`                | 3.22.4  | Schema validation  | TypeScript-first          |
| `dotenv`             | 16.4.1  | Environment config | Standard solution         |

### Development Dependencies

| Package      | Version | Purpose                |
| ------------ | ------- | ---------------------- |
| `typescript` | 5.3.3   | Type safety            |
| `prisma`     | 5.9.1   | ORM CLI                |
| `ts-node`    | 10.9.2  | TypeScript execution   |
| `tsx`        | 4.21.0  | Fast TypeScript runner |
| `nodemon`    | 3.0.3   | Development server     |
| `eslint`     | 8.56.0  | Code linting           |

**Rationale**: Backend uses stable, proven packages with strong TypeScript support. No major version upgrades needed.

---

## Website (Customer Frontend)

**Framework**: Next.js 14.2.0  
**Runtime**: React 18.3.1  
**Status**: ✅ Stable

### Core Dependencies

| Package                     | Version | Purpose          | Notes                  |
| --------------------------- | ------- | ---------------- | ---------------------- |
| `next`                      | 14.2.0  | React framework  | App Router, SSR        |
| `react`                     | 18.3.1  | UI library       | Stable release         |
| `react-dom`                 | 18.3.1  | React DOM        | Matches React version  |
| `@googlemaps/js-api-loader` | 2.0.2   | Maps integration | Official Google loader |

### Development Dependencies

| Package        | Version | Purpose        |
| -------------- | ------- | -------------- |
| `typescript`   | 5.x     | Type safety    |
| `tailwindcss`  | 3.4.15  | CSS framework  |
| `autoprefixer` | 10.4.20 | CSS prefixing  |
| `postcss`      | 8.4.47  | CSS processing |
| `eslint`       | 8.x     | Code linting   |

**Rationale**: Next.js 14 with React 18 provides a stable, well-documented foundation. TailwindCSS v3 is mature and has extensive ecosystem support.

---

## Admin Panel

**Framework**: Next.js 16.1.4  
**Runtime**: React 19.2.3  
**Status**: ⚠️ Using newer versions than Website

### Core Dependencies

| Package     | Version | Purpose         | Notes                 |
| ----------- | ------- | --------------- | --------------------- |
| `next`      | 16.1.4  | React framework | Latest version        |
| `react`     | 19.2.3  | UI library      | Latest with compiler  |
| `react-dom` | 19.2.3  | React DOM       | Matches React version |

### Development Dependencies

| Package                       | Version | Purpose             |
| ----------------------------- | ------- | ------------------- |
| `typescript`                  | 5.x     | Type safety         |
| `tailwindcss`                 | 4.x     | CSS framework       |
| `@tailwindcss/postcss`        | 4.x     | Tailwind v4 PostCSS |
| `babel-plugin-react-compiler` | 1.0.0   | React optimization  |
| `eslint`                      | 9.x     | Code linting        |

**Rationale**: Admin panel uses latest Next.js 16 and React 19 for improved performance and React Compiler support. TailwindCSS v4 provides smaller bundle sizes.

---

## Version Strategy

### Current State

| Component       | Next.js | React  | TailwindCSS | TypeScript |
| --------------- | ------- | ------ | ----------- | ---------- |
| **Website**     | 14.2.0  | 18.3.1 | 3.4.15      | 5.x        |
| **Admin Panel** | 16.1.4  | 19.2.3 | 4.x         | 5.x        |

### Version Discrepancy

> [!WARNING]
> **Inconsistent Versions Detected**
>
> The Website and Admin Panel use different major versions of Next.js, React, and TailwindCSS, which may lead to:
>
> - Increased maintenance complexity
> - Component incompatibility between projects
> - Different behaviors and best practices to manage

### Recommended Approaches

#### Option 1: Align to Next.js 14 (Conservative) ✅

**When to choose**: Stability is critical, Website is in active production

**Pros**:

- Proven stability with extensive production use
- Large community support and documentation
- Fewer breaking changes to manage
- Unified codebase for easier maintenance

**Cons**:

- Missing Next.js 16 performance improvements
- No React 19 features (React Compiler, etc.)
- Will need migration effort later

**Action Items**:

```bash
cd admin-panel
npm install next@14.2.0 react@18.3.1 react-dom@18.3.1
npm install -D tailwindcss@3.4.15 eslint@8
# Remove @tailwindcss/postcss and babel-plugin-react-compiler
```

#### Option 2: Upgrade to Next.js 16 (Progressive) 🚀

**When to choose**: Team can handle migration, want latest features

**Pros**:

- Latest performance optimizations
- React 19 features and React Compiler
- Future-proof approach
- Unified modern stack

**Cons**:

- Requires migration effort for Website
- Breaking changes to handle (async params, config changes)
- Less battle-tested in production

**Action Items**:

```bash
cd Website
npx @next/codemod upgrade 16
# Follow migration guide for TailwindCSS v3 to v4
npx @tailwindcss/upgrade
```

**Migration Considerations**:

- Next.js 16 requires Node.js 20+
- Must handle async `params` in Server Components
- Update environment variable handling (`NEXT_PUBLIC_` prefix)
- TailwindCSS v4 has breaking config changes

---

## Dependency Update Strategy

### Security Updates

**Frequency**: Immediate when vulnerabilities found

**Process**:

```bash
npm audit
npm audit fix
```

### Minor/Patch Updates

**Frequency**: Monthly

**Process**:

```bash
npm outdated
npm update
```

**Testing**: Run full test suite and manual QA

### Major Updates

**Frequency**: Quarterly or as needed

**Process**:

1. Review changelog and breaking changes
2. Create feature branch
3. Update dependencies
4. Run automated tests
5. Manual QA on staging
6. Gradual rollout to production

---

## Browser Support

### Website & Admin Panel

- **Safari**: 16.4+
- **Chrome**: 111+
- **Firefox**: 128+

### Backend

- **Node.js**: 20.0.0+

---

## Package Management

### Lock Files

**Backend & Website**: `package-lock.json` (npm)  
**Admin Panel**: `package-lock.json` (npm)

> [!IMPORTANT]
> Always commit lock files to ensure consistent installations across environments

### CI/CD

Use `npm ci` instead of `npm install` for reproducible builds:

```bash
# In CI/CD pipeline
npm ci
```

---

## Security Considerations

### Audit Schedule

- **Weekly**: Automated `npm audit` in CI/CD
- **Monthly**: Manual review of audit results
- **Immediate**: Critical vulnerability patches

### Dependency Sources

All packages installed from official npm registry. No private or custom registries.

### Vulnerability Response

1. **Critical**: Patch within 24 hours
2. **High**: Patch within 1 week
3. **Medium**: Patch within 1 month
4. **Low**: Address in next scheduled update

---

## Future Considerations

### Monorepo

Consider migrating to a monorepo structure with tools like Turborepo or Nx for:

- Shared dependencies
- Consistent versioning
- Shared components between Website and Admin Panel
- Unified build pipeline

### Package Updates

**Q2 2026**:

- Reassess Next.js version strategy
- Consider upgrading to Next.js 16 if stable
- Evaluate new dependencies for improved DX

---

## Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Prisma Documentation](https://prisma.io/docs)
- [Express.js Guide](https://expressjs.com)

### Verification Report

See [`library-verification-report.md`](file:///home/samito/.gemini/antigravity/brain/2c464857-fe51-4876-ac03-c3d650211d89/library-verification-report.md) for detailed Context7 MCP verification of all packages.

---

**Last Updated**: 2026-01-28  
**Review Schedule**: Quarterly
