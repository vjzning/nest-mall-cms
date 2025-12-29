FROM node:20-slim AS base
RUN npm install -g pnpm

# 1. 依赖阶段：只安装生产环境依赖，用于最终运行
FROM base AS prod-deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/web-admin/package.json ./apps/web-admin/
COPY apps/web-store/package.json ./apps/web-store/
COPY packages/shared/package.json ./packages/shared/
COPY packages/queue/package.json ./packages/queue/
RUN pnpm install --prod --frozen-lockfile

# 2. 构建阶段：安装所有依赖并编译
FROM base AS builder
WORKDIR /app
# 先复制所有文件，确保 pnpm install 时能正确处理 monorepo 链接
COPY . .
RUN pnpm config set fetch-retries 5
RUN pnpm config set network-concurrency 1
RUN pnpm install --frozen-lockfile

# 使用 pnpm deploy 为 web-admin 创建独立目录并构建
# 使用 --legacy 标志以兼容 pnpm v10+ 的部署行为
RUN pnpm deploy --legacy --filter @app/web-admin /pruned/web-admin
# 覆盖 vite.config.ts 中的 outDir，确保产物生成在本地 dist 目录
RUN cd /pruned/web-admin && pnpm vite build --outDir dist

# 使用 pnpm deploy 为 web-store 创建独立目录并构建
RUN pnpm deploy --legacy --filter @app/web-store /pruned/web-store
# Astro 默认输出到 dist，确保一致性
RUN cd /pruned/web-store && pnpm astro build --outDir dist

# 构建 API
RUN pnpm build:api-admin && pnpm build:api-store

# 3. 运行阶段
FROM node:20-slim AS runtime
RUN apt-get update && apt-get install -y nginx && \
    npm install -g pm2 serve && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules
# 复制 API 产物
COPY --from=builder /app/dist ./dist
# 复制 Web 产物
COPY --from=builder /pruned/web-admin/dist ./apps/web-admin/dist
COPY --from=builder /pruned/web-store/dist ./apps/web-store/dist
# 复制配置文件
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/package.json ./

EXPOSE 80

CMD service nginx start && pm2-runtime start ecosystem.config.cjs
