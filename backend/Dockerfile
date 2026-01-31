# ===========================
# Stage 1: Dependencies
# ===========================
FROM node:20-alpine AS deps

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production && \
    npm cache clean --force

# ===========================
# Stage 2: Builder
# ===========================
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ===========================
# Stage 3: Runner (Production)
# ===========================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Install runtime dependencies (OpenSSL for Prisma, tsx for seeding)
RUN apk add --no-cache openssl libc6-compat && \
    npm install -g tsx

# Copy built files from builder
COPY --from=builder --chown=backend:nodejs /app/dist ./dist

# Copy base dependencies first
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules

# Then overlay generated Prisma Client
COPY --from=builder --chown=backend:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=backend:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy necessary files
COPY --chown=backend:nodejs package.json ./
COPY --chown=backend:nodejs prisma ./prisma

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
