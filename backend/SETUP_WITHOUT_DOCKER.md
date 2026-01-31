# Running Without Docker - Quick Setup Guide

Since Docker isn't running on your system, here's how to run the backend directly with Node.js:

## Prerequisites

1. **PostgreSQL** - Install and start PostgreSQL:

   ```bash
   # For Fedora
   sudo dnf install postgresql postgresql-server
   sudo postgresql-setup --initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   # In PostgreSQL prompt:
   CREATE DATABASE farmer_dairy;
   CREATE USER farmer_dairy WITH PASSWORD 'farmer_dairy_dev_pass';
   GRANT ALL PRIVILEGES ON DATABASE farmer_dairy TO farmer_dairy;
   \q
   ```

## Setup Steps

1. **Copy environment file**:

   ```bash
   cd /home/samito/Downloads/Farmer-Dairy/backend
   cp .env.example .env
   ```

2. **Edit .env file** - Update the DATABASE_URL:

   ```bash
   DATABASE_URL=postgresql://farmer_dairy:farmer_dairy_dev_pass@localhost:5432/farmer_dairy?schema=public
   ```

3. **Install dependencies** (already done):

   ```bash
   npm install
   ```

4. **Generate Prisma client**:

   ```bash
   npx prisma generate
   ```

5. **Run database migrations**:

   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database** (optional):

   ```bash
   npm run seed
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will start on http://localhost:3000

## Test It

```bash
# Health check
curl http://localhost:3000/health

# List products
curl http://localhost:3000/api/v1/products
```

## If You Want to Use Docker Later

To start Docker on Fedora:

```bash
sudo systemctl start docker
sudo systemctl enable docker
# Add your user to docker group (logout/login required after)
sudo usermod -aG docker $USER
```

Then you can use `docker-compose up` as documented in the README.
