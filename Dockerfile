# 启用 BuildKit 语法特性（建议在文件首行添加）
# syntax=docker/dockerfile:1

FROM node:20-slim AS base
# 使用 Corepack 启用 pnpm，比 npm i -g 快且版本固定
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. 构建与依赖安装阶段（合并以利用缓存）
FROM base AS builder
WORKDIR /app

# 关键优化 A: 首先只复制 lockfile，利用 pnpm fetch 下载依赖到虚拟存储
# 这样只有 lockfile 变动时才会重新下载包
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# 关键优化 B: 复制剩余源码
COPY . .

# 关键优化 C: 离线安装依赖（利用 fetch 的结果），并挂载缓存
# --offline: 使用 fetch 预下载的包
# --frozen-lockfile: 确保不做版本变更
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

# Web Admin 构建
RUN pnpm deploy --legacy --filter @app/web-admin /pruned/web-admin
RUN cd /pruned/web-admin && pnpm vite build --outDir dist

# Web Store 构建
RUN pnpm deploy --legacy --filter @app/web-store /pruned/web-store
RUN cd /pruned/web-store && pnpm astro build --outDir dist

# API 构建 (关键优化 D: 并行执行构建命令)
# 假设 package.json 中有 build:api-admin 和 build:api-store
# 使用 & 同时运行，wait 等待结束
RUN pnpm build:api-admin & pnpm build:api-store & wait

# 2. 生产依赖提取阶段
# 为了得到纯净的 node_modules，我们基于 builder 再次处理，或者重新 install --prod
FROM base AS prod-deps
WORKDIR /app
COPY pnpm-lock.yaml ./
# 从 builder 阶段复制 fetch 好的缓存，避免再次网络下载（可选，或者直接 mount）
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages
# 注意：这里需要复制相关 workspace 的 package.json，如果结构复杂，建议使用 pnpm deploy 导出 prod 包
# 这里为了简便，复用 builder 的源码结构，但只安装 prod 依赖
COPY --from=builder /app/apps/web-admin/package.json ./apps/web-admin/
COPY --from=builder /app/apps/web-store/package.json ./apps/web-store/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/queue/package.json ./packages/queue/
COPY --from=builder /app/pnpm-workspace.yaml ./

# 只安装生产依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

# 3. 运行阶段
FROM node:20-slim AS runtime

# 优化 E: 合并 RUN 指令减少层数，清理缓存
RUN apt-get update && apt-get install -y nginx --no-install-recommends && \
    npm install -g pm2 serve && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

WORKDIR /app

# 复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules
# 复制 API 产物
COPY --from=builder /app/dist ./dist
# 复制 Web 产物
COPY --from=builder /pruned/web-admin/dist ./apps/web-admin/dist
COPY --from=builder /pruned/web-store/dist ./apps/web-store/dist
# 复制配置
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/package.json ./

EXPOSE 80

CMD ["sh", "-c", "service nginx start && pm2-runtime start ecosystem.config.cjs"]