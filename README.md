# Nest-11: AI-Powered Full-Stack Mall & CMS System

> **重要声明：本项目的所有代码（包括后端 API、前端网页、后台管理系统、数据库设计及本 README）均由 AI (Trae + Gemini-2.0-Flash/Gemini-3-Flash-Preview) 自动生成。**
> 
> 这是一次关于 AI 驱动软件开发的深度实验，展示了在极少人工干预的情况下，如何构建一个复杂的、具备生产力潜质的全stack系统。

## 🚀 项目概览

Nest-11 是一个高性能、现代化的全栈电商与内容管理系统（CMS）。它采用了微服务化的 Monorepo 架构，涵盖了从后端接口到前台展示，再到后台管理的完整链路。

### 🌟 核心特性
- **AI 全量生成**：从架构设计到一行行逻辑代码，全部由 AI 独立完成。
- **Monorepo 架构**：基于 Pnpm Workspace，实现代码高度复用与统一管理。
- **现代化技术栈**：集成 NestJS 11、Astro 5、React 19 等前沿框架。
- **全功能电商流程**：涵盖商品浏览、购物车、订单管理、收藏夹、个人中心及支付模拟。
- **强大的 CMS 核心**：支持文章管理、分类、标签、字典、配置及灵活的权限控制。
- **多端支持**：针对 Web 端（Astro）和管理端（React + Shadcn UI）进行了深度优化。

---

## 🛠️ 技术栈详情

### 后端 (Apps/API)
- **核心框架**: [NestJS 11](https://nestjs.com/) (Node.js 渐进式框架)
- **数据库 ORM**: [TypeORM](https://typeorm.io/) (支持 MySQL 8.0+)
- **身份认证**: Passport.js + JWT (支持 GitHub, 微信等第三方登录)
- **任务队列**: BullMQ + Redis (处理高并发任务与异步逻辑)
- **缓存管理**: Cache Manager + Redis
- **文件存储**: 支持本地、阿里云 OSS、AWS S3
- **文档规范**: Swagger (OpenAPI)
- **校验与转换**: Class-validator & Class-transformer

### 前端 (Apps/Web)
- **商城前台 (Web-Store)**:
  - **框架**: [Astro 5](https://astro.build/) (采用最新的 Server Islands 与 Actions 特性)
  - **UI 库**: React 19 (作为 Islands 组件)
  - **样式**: Tailwind CSS 4
  - **状态管理**: Nano Stores (轻量级跨框架状态管理)
- **管理后台 (Web-Admin)**:
  - **框架**: Vite + React 19
  - **UI 框架**: [Shadcn UI](https://ui.shadcn.com/) (基于 Radix UI)
  - **路由/状态**: TanStack Router & TanStack Query (React Query)
  - **表单**: React Hook Form + Zod

### 共享库 (Packages)
- **db**: 统一的实体定义与数据库迁移逻辑。
- **shared**: 跨项目复用的配置、常量及通用工具函数。

---

## 📂 项目结构

```text
nest-11/
├── apps/
│   ├── api-admin/      # 后台管理系统 API
│   ├── api-store/      # 商城前台 API
│   ├── web-admin/      # 基于 React 的后台管理系统
│   └── web-store/      # 基于 Astro 的商城前台网页
├── packages/
│   ├── db/             # 数据库实体与配置
│   ├── shared/         # 公用工具库与类型定义
│   └── payment/        # 支付 SDK 封装
└── README.md
```

---

## 🤖 AI 开发足迹

本项目利用 Trae 提供的强大 AI 能力，通过自然语言对话完成了以下挑战：
1. **复杂逻辑实现**：如带事务的订单处理、库存扣减、复杂的权限校验拦截器。
2. **组件库转换**：将 React 组件库平滑重构为 Astro 原生组件，提升 SSR 性能。
3. **性能优化**：AI 自动识别并修复了 N+1 查询问题，优化了前端资源加载。
4. **错误排查**：在开发过程中出现的 JWT 解析错误、数据库约束冲突等，均由 AI 自主分析并修复。

---

## ⚙️ 快速开始

### 环境要求
- Node.js >= 20
- Pnpm >= 9
- MySQL >= 8
- Redis >= 6

### 安装与启动
1. **克隆并安装依赖**
   ```bash
   pnpm install
   ```
2. **环境配置**
   复制 `apps/api-admin/.env.example` 为 `.env` 并配置数据库连接。
3. **启动项目**
   - 启动 API (Admin): `pnpm dev:api-admin`
   - 启动 API (Store): `pnpm dev:api-store`
   - 启动管理端: `pnpm dev:admin`
   - 启动商城端: `pnpm dev:store`

---

## 🚢 部署指南 (Docker)

本项目支持将 4 个子应用（2 个 API，2 个 Web）打包到同一个 Docker 镜像中，方便在免费平台上部署。

### 推荐的免费部署平台
1. **[Zeabur](https://zeabur.com/)** (推荐): 对全栈项目非常友好，支持 Docker，有免费额度。
2. **[Railway](https://railway.app/)**: 部署简单，提供试用额度。
3. **[Hugging Face Spaces](https://huggingface.co/spaces)**: 免费提供 CPU 实例，支持 Docker。
4. **[Oracle Cloud Always Free](https://www.oracle.com/cloud/free/)**: 提供强大的 ARM 实例，完全免费，适合长期运行。

### Docker 部署步骤
1. **构建镜像**
   ```bash
   docker build -t nest-11-fullstack .
   ```
2. **运行容器**
   运行前请确保已准备好 MySQL 和 Redis 环境。
   ```bash
   docker run -d \
     -p 80:80 \
     -e DATABASE_URL="mysql://user:pass@host:3306/db" \
     -e REDIS_HOST="your-redis-host" \
     nest-11-fullstack
   ```

### 内部端口路由
容器启动后，Nginx 会监听 80 端口并根据路径分发请求：
- `http://localhost/` -> 商城前台 (Astro SSR)
- `http://localhost/admin/` -> 管理后台 (React Static)
- `http://localhost/api/admin/` -> 管理端 API
- `http://localhost/api/store/` -> 商城端 API

---

## 📜 许可证

UNLICENSED (仅供学习与 AI 能力展示参考)
