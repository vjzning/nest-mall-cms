# Stage 1: Build
FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api-admin/package.json ./apps/api-admin/
COPY apps/api-store/package.json ./apps/api-store/
COPY apps/web-admin/package.json ./apps/web-admin/
COPY apps/web-store/package.json ./apps/web-store/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/payment/package.json ./packages/payment/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all apps
RUN pnpm build:all

# Stage 2: Runtime
FROM node:20-slim

# Install Nginx and PM2
RUN apt-get update && apt-get install -y nginx && \
    npm install -g pm2 serve && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/web-admin/dist ./apps/web-admin/dist
COPY --from=builder /app/apps/web-store/dist ./apps/web-store/dist
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 80 (Nginx)
EXPOSE 80

# Start script
CMD service nginx start && pm2-runtime start ecosystem.config.cjs
