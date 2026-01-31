# Farmer-Dairy Backend

Production-grade, cloud-agnostic e-commerce backend built with Node.js, TypeScript, PostgreSQL, and Prisma.

## 🌟 Features

- **Cloud-Agnostic**: Deploy on Google Cloud Run, AWS ECS, DigitalOcean App Platform, or any Docker platform
- **Stateless Architecture**: Horizontal scaling with no session affinity required
- **Phone-Based Auth**: OTP authentication with JWT access + refresh tokens
- **Server-Side Cart**: Stateless client support with backend cart management
- **Transactional Orders**: Atomic order creation with stock management
- **Production-Ready**: Rate limiting, validation, error handling, security headers
- **Fully Containerized**: Multi-stage Docker build with Alpine Linux
- **Config-Driven**: 100% environment variable configuration

## 🏗️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Caching**: Redis (optional, for rate limiting)
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcrypt, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Environment, database, JWT config
│   ├── middleware/      # Auth, validation, error handling, rate limiting
│   ├── routes/          # API endpoints (v1)
│   │   └── v1/
│   │       ├── admin/   # Admin routes
│   │       ├── auth.routes.ts
│   │       ├── user.routes.ts
│   │       ├── product.routes.ts
│   │       ├── category.routes.ts
│   │       ├── cart.routes.ts
│   │       └── order.routes.ts
│   ├── services/        # Business logic
│   ├── utils/           # Helpers (pagination, errors, logger, response)
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
├── Dockerfile           # Multi-stage production build
├── docker-compose.yml   # Local development setup
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- Redis (optional, for production rate limiting)

### Local Development (Without Docker)

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations**:

   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database** (optional):

   ```bash
   npm run seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:3000`

### Local Development (With Docker)

1. **Start all services**:
   ```bash
   docker-compose up
   ```

This starts:

- PostgreSQL on port 5432
- Redis on port 6379
- Backend on port 3000

2. **Run migrations** (first time only):

   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

3. **Seed database** (optional):
   ```bash
   docker-compose exec backend npm run seed
   ```

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

| Variable             | Description                            | Example                                              |
| -------------------- | -------------------------------------- | ---------------------------------------------------- |
| `NODE_ENV`           | Environment                            | `development` \| `production`                        |
| `PORT`               | Server port                            | `3000`                                               |
| `BASE_URL`           | Base URL                               | `http://localhost:3000`                              |
| `DATABASE_URL`       | PostgreSQL connection string           | `postgresql://user:pass@localhost:5432/Farmer-Dairy` |
| `JWT_SECRET`         | JWT signing key (min 32 chars)         | `your-secret-key`                                    |
| `JWT_REFRESH_SECRET` | Refresh token key (min 32 chars)       | `your-refresh-key`                                   |
| `ALLOWED_ORIGINS`    | CORS allowed origins (comma-separated) | `http://localhost:3000`                              |
| `REDIS_URL`          | Redis connection (optional)            | `redis://localhost:6379`                             |
| `OTP_PROVIDER`       | OTP provider                           | `console` \| `twilio` \| `aws-sns`                   |
| `ADMIN_EMAIL`        | Default admin email                    | `admin@Farmer-Dairy.com`                             |
| `ADMIN_PASSWORD`     | Default admin password                 | `changeme123`                                        |

## 🔐 Authentication Flow

### User Authentication (OTP)

1. **Request OTP**:

   ```bash
   POST /api/v1/auth/send-otp
   { "phone": "+1234567890" }
   ```

2. **Verify OTP & Login**:

   ```bash
   POST /api/v1/auth/verify-otp
   { "phone": "+1234567890", "code": "123456" }
   # Returns: { accessToken, refreshToken }
   ```

3. **Use Access Token**:

   ```bash
   Authorization: Bearer <accessToken>
   ```

4. **Refresh Access Token**:
   ```bash
   POST /api/v1/auth/refresh
   { "refreshToken": "<refreshToken>" }
   ```

### Admin Authentication

```bash
POST /api/v1/auth/admin/login
{ "email": "admin@Farmer-Dairy.com", "password": "changeme123" }
```

## 📚 API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP & login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/products` - List products (with pagination & filters)
- `GET /api/v1/products/:slug` - Get product by slug
- `GET /api/v1/categories` - List categories

### User Endpoints (Require Auth)

- `GET /api/v1/users/me` - Get profile
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users/me/addresses` - List addresses
- `POST /api/v1/users/me/addresses` - Add address
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `PATCH /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove from cart
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order details

### Admin Endpoints (Require Admin Auth)

- `POST /api/v1/admin/products` - Create product
- `PATCH /api/v1/admin/products/:id` - Update product
- `DELETE /api/v1/admin/products/:id` - Delete product
- `POST /api/v1/admin/categories` - Create category
- `PATCH /api/v1/admin/categories/:id` - Update category
- `DELETE /api/v1/admin/categories/:id` - Delete category
- `GET /api/v1/admin/orders` - List all orders
- `PATCH /api/v1/admin/orders/:id/status` - Update order status

## 🐳 Docker Deployment

### Build Production Image

```bash
docker build -t Farmer-Dairy-backend:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  Farmer-Dairy-backend:latest
```

## ☁️ Cloud Deployment

### Google Cloud Run

1. **Build and push image**:

   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/Farmer-Dairy-backend
   ```

2. **Deploy**:
   ```bash
   gcloud run deploy Farmer-Dairy-backend \
     --image gcr.io/YOUR_PROJECT/Farmer-Dairy-backend \
     --platform managed \
     --region us-central1 \
     --set-env-vars DATABASE_URL="...",JWT_SECRET="..." \
     --add-cloudsql-instances PROJECT:REGION:INSTANCE
   ```

### AWS ECS

1. **Push to ECR**:

   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin ECR_URI
   docker tag Farmer-Dairy-backend:latest ECR_URI:latest
   docker push ECR_URI:latest
   ```

2. **Create task definition** with environment variables
3. **Deploy to ECS cluster**

### DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Configure**:
   - Dockerfile path: `backend/Dockerfile`
   - HTTP port: `3000`
   - Environment variables from `.env.example`
3. **Add managed PostgreSQL database**
4. **Deploy**

## 🗄️ Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name migration_name
```

### Apply Migration (Production)

```bash
npx prisma migrate deploy
```

### Reset Database (Development)

```bash
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## 🔒 Security Features

- **JWT Authentication**: Secure access + refresh token system
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: Configurable limits on auth endpoints
- **Input Validation**: Zod schema validation on all endpoints
- **Security Headers**: Helmet.js for HTTP security
- **CORS**: Configurable allowed origins
- **Non-Root Container**: Docker runs as non-privileged user

## 🌍 Cloud Portability

This backend is designed to run anywhere:

- **Database**: Pure PostgreSQL (Cloud SQL, RDS, Managed PostgreSQL)
- **Sessions**: JWT in client + refresh tokens in DB (no sticky sessions)
- **Files**: Object storage via URLs (GCS, S3, Spaces)
- **Config**: Environment variables (no vendor SDKs in business logic)
- **Container**: Standard Docker image (runs on any platform)

### Migration Example (GCP → AWS)

1. Export PostgreSQL from Cloud SQL
2. Import to AWS RDS
3. Update `DATABASE_URL` environment variable
4. Update object storage URLs (GCS → S3)
5. Deploy same Docker image to ECS
6. **Zero code changes required** ✅

## 📈 Scaling Strategy

- **Horizontal**: Add container instances (stateless design)
- **Database**: Read replicas for queries
- **Caching**: Redis for rate limiting + optional query cache
- **CDN**: CloudFlare/Fastly in front of object storage

## 🤝 Contributing

1. Follow existing code structure
2. Use TypeScript strict mode
3. Add validation schemas for new endpoints
4. Update API documentation
5. Test with both development and production builds

## 📄 License

MIT

## 🆘 Support

For issues or questions, please open a GitHub issue.
