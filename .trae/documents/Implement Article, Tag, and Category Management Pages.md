# Implementation Plan: Article Management Features

## Overview
Implement the frontend pages for Tag, Category, and Article management, replacing the "Todo" placeholders.

## Frontend Implementation (`apps/admin-web`)

### 1. Tag Management (`features/tag`)
- **API Client**: `tagApi` (CRUD operations).
- **Components**:
  - `TagList`: Table view of tags (id, name, slug, count).
  - `TagDialog`: Create/Edit form (name, slug).
- **Route**: Already exists (`/tag`).

### 2. Category Management (`features/category`)
- **API Client**: `categoryApi` (CRUD operations).
- **Components**:
  - `CategoryList`: Tree-table or indented list (id, name, slug, parent).
  - `CategoryDialog`: Create/Edit form (name, slug, parentId).
- **Route**: Already exists (`/category`).

### 3. Article Management (`features/article`)
- **API Client**: `articleApi` (CRUD, audit).
- **Components**:
  - `ArticleList`: Table view (title, author, category, tags, status, created_at).
    - Filters: Search, Category, Status.
    - Actions: Edit, Delete, Audit (Approve/Reject).
  - `ArticleEditor`: Form for creating/editing articles.
    - Fields: Title, Slug, Content (Markdown/Rich Text - use simple textarea for now or integrating a basic editor), Category, Tags, Cover Image (use `UploadDialog` or `ResourceList` picker).
- **Route**: Already exists (`/article`).

### 4. Shared Improvements
- **Layout Fix**: Remove `p-8` from the root div of these pages as requested, since the layout container likely handles padding.
- **Rich Text Editor**: Install a lightweight editor (e.g., `@uiw/react-md-editor` or `react-quill`) for article content if time permits, otherwise `Textarea`. *Decision: Use `Textarea` for MVP to avoid extra deps/complexity in this turn, or a simple Markdown preview.*

## Step-by-Step

1.  **Tag Feature**:
    - Create `features/tag/api.ts`.
    - Implement `TagList` and `TagDialog` in `features/tag/`.
    - Update `features/tag/tag-list.tsx`.

2.  **Category Feature**:
    - Create `features/category/api.ts`.
    - Implement `CategoryList` and `CategoryDialog` in `features/category/`.
    - Update `features/category/category-list.tsx`.

3.  **Article Feature**:
    - Create `features/article/api.ts`.
    - Implement `ArticleList` and `ArticleForm` (Dialog or Page).
    - Update `features/article/article-list.tsx`.

4.  **Verification**:
    - Check pages load data.
    - Check CRUD operations.
    - Check layout padding.

## Note on Layout
The user specifically asked to remove `p-8` from the root div. I will ensure the top-level container in these components uses `h-full flex flex-col gap-4` (or similar) without padding if the parent layout provides it.

