# 内容管理系统 (CMS) 产品需求文档 (PRD) & 架构设计

## 1. 项目概述
本项目旨在构建一个基于 NestJS Monorepo 架构的高性能、可扩展的内容管理系统。系统将分为两个核心服务：
1.  **管理后台 API (Admin API)**: 为运营人员、管理员提供内容管理、用户管理、系统配置等功能。
2.  **内容分发 API (Content API)**: 为前端应用（Web, H5, 小程序等）提供高性能的内容查询接口。

## 2. 技术架构
采用 Monorepo 模式管理代码，确保代码复用和统一维护。

### 2.1 目录结构规划
```text
nest-11/
├── apps/
│   ├── cms-admin-api/      # 管理后台接口服务
│   │   └── src/
│   │       ├── modules/    # 业务模块 (Auth, User, Article, etc.)
│   │       └── main.ts
│   └── cms-content-api/    # 前端内容接口服务
│       └── src/
│           ├── modules/    # 业务模块 (Content, Search, Comment)
│           └── main.ts
├── libs/
│   ├── common/             # 公共模块
│   │   ├── src/
│   │   │   ├── database/   # 数据库连接与配置
│   │   │   ├── filters/    # 全局异常拦截
│   │   │   ├── guards/     # 守卫 (Auth, Role)
│   │   │   ├── interceptors/
│   │   │   └── utils/
│   └── db/                 # 数据库实体定义 (TypeORM Entities)
│       └── src/
│           ├── entities/   # 所有共享的 Entity
│           └── repositories/
```

### 2.2 核心技术栈
*   **Framework**: NestJS
*   **Database**: MySQL / PostgreSQL
*   **ORM**: TypeORM
*   **Caching**: Redis (用于缓存热点内容和 Session)
*   **Auth**: JWT + RBAC (Role-Based Access Control)
*   **Documentation**: Swagger (OpenAPI)

## 3. 数据库设计 (Database Schema)

数据库设计分为 **系统管理 (System)** 和 **内容业务 (CMS)** 两大板块。

### 3.1 系统管理模块 (System)

#### 3.1.1 管理员表 (`sys_user`)
用于存储后台管理人员信息。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键, 自增 |
| username | VARCHAR | 50 | Y | 用户名 (唯一) |
| password | VARCHAR | 100 | Y | 加密后的密码 |
| nickname | VARCHAR | 50 | N | 昵称 |
| avatar | VARCHAR | 255 | N | 头像 URL |
| email | VARCHAR | 100 | N | 邮箱 |
| phone | VARCHAR | 20 | N | 手机号 |
| status | TINYINT | 1 | Y | 状态 (1:启用, 0:禁用) |
| created_at | DATETIME | - | Y | 创建时间 |
| updated_at | DATETIME | - | Y | 更新时间 |

#### 3.1.2 角色表 (`sys_role`)
定义系统角色（如：超级管理员、内容编辑、审核员）。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键, 自增 |
| code | VARCHAR | 50 | Y | 角色编码 (如: ADMIN, EDITOR) |
| name | VARCHAR | 50 | Y | 角色名称 |
| description | VARCHAR | 255 | N | 描述 |
| created_at | DATETIME | - | Y | 创建时间 |

#### 3.1.3 权限/菜单表 (`sys_menu`)
定义后台菜单结构和操作权限（按钮级别）。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键, 自增 |
| parent_id | BIGINT | 20 | N | 父菜单ID (0为顶级) |
| name | VARCHAR | 50 | Y | 菜单/权限名称 |
| code | VARCHAR | 100 | Y | 权限标识 (system:user:list) |
| type | TINYINT | 1 | Y | 类型 (1:目录, 2:菜单, 3:按钮) |
| path | VARCHAR | 200 | N | 路由路径 |
| component | VARCHAR | 255 | N | 前端组件路径 |
| icon | VARCHAR | 50 | N | 图标 |
| sort | INT | 11 | N | 排序 |

#### 3.1.4 角色-菜单关联表 (`sys_role_menu`)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| role_id | BIGINT | 角色ID |
| menu_id | BIGINT | 菜单ID |

#### 3.1.5 用户-角色关联表 (`sys_user_role`)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| user_id | BIGINT | 用户ID |
| role_id | BIGINT | 角色ID |

---

### 3.2 内容业务模块 (CMS)

#### 3.2.1 文章/内容表 (`cms_article`)
核心内容表。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键 |
| title | VARCHAR | 255 | Y | 标题 |
| slug | VARCHAR | 255 | N | URL友好别名 (唯一) |
| cover | VARCHAR | 255 | N | 封面图 |
| summary | VARCHAR | 500 | N | 摘要 |
| content | TEXT/LONGTEXT | - | N | 内容 (Markdown 或 HTML) |
| category_id | BIGINT | 20 | Y | 分类ID |
| author_id | BIGINT | 20 | N | 作者ID (关联 sys_user) |
| status | TINYINT | 1 | Y | 状态 (0:草稿, 1:发布, 2:下架) |
| views | INT | 11 | N | 阅读量 |
| is_top | TINYINT | 1 | N | 是否置顶 (0:否, 1:是) |
| published_at | DATETIME | - | N | 发布时间 |
| created_at | DATETIME | - | Y | 创建时间 |
| updated_at | DATETIME | - | Y | 更新时间 |

#### 3.2.2 分类表 (`cms_category`)
树形分类结构。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键 |
| parent_id | BIGINT | 20 | N | 父分类ID |
| name | VARCHAR | 50 | Y | 分类名称 |
| slug | VARCHAR | 50 | N | 分类别名 |
| description | VARCHAR | 255 | N | 描述 |
| sort | INT | 11 | N | 排序 |
| created_at | DATETIME | - | Y | 创建时间 |

#### 3.2.3 标签表 (`cms_tag`)
| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键 |
| name | VARCHAR | 50 | Y | 标签名称 |
| created_at | DATETIME | - | Y | 创建时间 |

#### 3.2.4 文章-标签关联表 (`cms_article_tag`)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| article_id | BIGINT | 文章ID |
| tag_id | BIGINT | 标签ID |

#### 3.2.5 附件/资源表 (`sys_file`)
统一管理上传的图片、视频、文档。

| 字段名 | 类型 | 长度 | 必填 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| id | BIGINT | 20 | Y | 主键 |
| original_name | VARCHAR | 255 | Y | 原始文件名 |
| filename | VARCHAR | 255 | Y | 存储文件名 |
| path | VARCHAR | 255 | Y | 存储路径/URL |
| mime_type | VARCHAR | 100 | N | 文件类型 |
| size | BIGINT | 20 | N | 文件大小 (字节) |
| uploader_id | BIGINT | 20 | N | 上传者ID |
| created_at | DATETIME | - | Y | 创建时间 |

---

## 4. 功能需求详情

### 4.1 管理后台 (Admin API)
**目标用户**: 管理员, 编辑

1.  **用户与权限管理**
    *   登录/登出 (JWT)
    *   管理员增删改查
    *   角色管理 (分配权限)
    *   菜单管理 (动态路由)

2.  **内容管理**
    *   文章发布流程: 创建 -> 草稿 -> 审核(可选) -> 发布
    *   文章列表: 搜索、筛选、分页
    *   富文本编辑器/Markdown编辑器支持
    *   分类管理: 树形结构维护
    *   标签管理

3.  **资源管理**
    *   文件上传 (支持本地/OSS)
    *   图片库管理

4.  **系统设置**
    *   站点信息配置 (SEO标题, 关键词)
    *   敏感词过滤设置

### 4.2 前端内容服务 (Content API)
**目标用户**: 终端访客, 前端开发者

1.  **内容获取**
    *   获取文章列表 (支持按分类、标签、关键词筛选)
    *   获取文章详情 (包含上一篇/下一篇, 相关推荐)
    *   获取分类树/导航栏
    *   获取标签云

2.  **交互功能
    *   文章点赞/浏览量统计
    *   评论系统 (需登录或游客)

## 5. 接口设计规范 (RESTful)

### 5.1 Admin API 示例
*   `POST /admin/auth/login`: 登录
*   `GET /admin/articles`: 获取文章列表 (分页)
*   `POST /admin/articles`: 创建文章
*   `GET /admin/articles/:id`: 获取文章详情
*   `PUT /admin/articles/:id`: 更新文章
*   `DELETE /admin/articles/:id`: 删除文章

### 5.2 Content API 示例
*   `GET /api/posts`: 公开文章列表
*   `GET /api/posts/:slug`: 根据别名获取详情
*   `GET /api/categories`: 获取全部分类

## 6. 开发计划建议

1.  **Phase 1: 基础设施搭建**
    *   初始化 NestJS Monorepo
    *   配置 TypeORM & MySQL
    *   实现 Admin 登录 & RBAC 基础

2.  **Phase 2: 核心内容管理**
    *   实现分类、标签、文章的 CRUD
    *   集成文件上传

3.  **Phase 3: 前端接口开发**
    *   开发 Content API 读取接口
    *   性能优化 (Redis 缓存)
