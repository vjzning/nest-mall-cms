这是一个使用 **Vite + React + shadcn/ui** 开发 CMS 管理后台的规划方案。

我们将把前端项目放在 `apps/admin-web` 目录下，与后端的 NestJS 服务在同一个 Monorepo 中管理。

## 1. 项目初始化

*   **位置**: `apps/admin-web`
*   **技术栈**:
    *   构建工具: Vite
    *   框架: React (TypeScript)
    *   UI 组件库: shadcn/ui + Tailwind CSS
    *   状态管理: Zustand (轻量级全局状态) + TanStack Query (服务端数据状态)
    *   路由: React Router v6 (或 v7)
    *   图标库: Lucide React
    *   HTTP 客户端: Axios
    *   表单管理: React Hook Form + Zod (与后端 DTO 校验对应)

## 2. 目录结构规划

```
apps/admin-web/
├── src/
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   │   ├── ui/            # shadcn/ui 生成的基础组件
│   │   ├── layout/        # 布局组件 (Sidebar, Header)
│   │   └── business/      # 业务通用组件 (如 DataTable)
│   ├── features/          # 业务功能模块 (对应后端模块)
│   │   ├── auth/          # 登录/权限
│   │   ├── article/       # 文章管理
│   │   ├── category/      # 分类管理
│   │   ├── tag/           # 标签管理
│   │   ├── user/          # 用户管理
│   │   ├── role/          # 角色管理
│   │   └── menu/          # 菜单管理
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具库 (axios 封装, utils)
│   ├── stores/            # 全局状态 (Zustand)
│   ├── types/             # TS 类型定义
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 3. 核心功能与实现步骤

### 第一阶段：基础设施搭建
1.  **初始化项目**: 使用 Vite 创建 React TS 项目。
2.  **配置 Tailwind CSS**: 安装并配置 Tailwind。
3.  **集成 shadcn/ui**: 初始化 shadcn/ui 并添加常用组件 (Button, Input, Form, Table, Dropdown, Dialog 等)。
4.  **路由配置**: 搭建 React Router，配置基础 Layout (登录页 vs 后台主布局)。
5.  **网络层封装**: 封装 Axios，添加拦截器处理 JWT Token (自动附加 Header，401 自动跳转登录)。

### 第二阶段：认证与权限
1.  **登录页面**: 实现登录表单，对接 `POST /auth/login`。
2.  **权限控制**:
    *   存储 Token 和用户信息。
    *   实现 `RequireAuth` 路由守卫。
    *   根据用户角色/权限动态渲染侧边栏菜单 (对接 `GET /menu` 或用户详情接口)。

### 第三阶段：业务模块开发 (CRUD)
我们将封装一个通用的 `DataTable` 组件，用于快速开发列表页。

1.  **用户管理 (User)**: 列表、创建、编辑 (分配角色)、删除。
2.  **角色管理 (Role)**: 列表、创建、编辑 (分配菜单权限 - Tree 组件)、删除。
3.  **菜单管理 (Menu)**: 树形列表、创建、编辑、删除。
4.  **内容管理**:
    *   **文章 (Article)**: 列表 (支持筛选)、富文本编辑器 (推荐 Tiptap 或 Quill)、发布/审核。
    *   **分类 (Category)**: 列表、增删改。
    *   **标签 (Tag)**: 列表、增删改。

## 4. 后续优化
*   **暗黑模式**: 支持一键切换。
*   **响应式适配**: 适配移动端访问。
*   **国际化 (i18n)**: 预留多语言支持。

---

**您是否同意这个规划？**
如果同意，我将开始执行**第一阶段**：在 `apps/admin-web` 初始化项目并安装基础依赖。