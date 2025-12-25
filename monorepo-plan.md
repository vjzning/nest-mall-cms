# Universal Monorepo Project Architecture Plan

## 1. Vision
Transform the existing fragmented structure into a unified **pnpm Monorepo**. This consolidate backend services, administrative tools, and the consumer storefront into a single codebase for maximum developer velocity and type safety.

## 2. Global Structure
The root workspace will govern all projects.

```text
/nest-11/
├── apps/                  # Deployable Applications
│   ├── api-admin/         # NestJS: CMS Management API
│   ├── api-store/         # NestJS: Consumer Shop API (Content API)
│   ├── web-admin/         # React: Management Dashboard
│   └── web-store/         # Astro: "Nike Style" Consumer Storefront
├── packages/              # Shared Infrastructure & Code
│   ├── db/                # TypeORM Entities & Migrations (Shared by APIs)
│   ├── redis/             # Shared Cache & Lock logic
│   ├── payment/           # Shared Payment Processing logic
│   ├── shared/            # Universal DTOs, Types, and Utils (API + Web)
│   └── ui-theme/          # Shared Styling tokens, Tailwind config, Icons
├── pnpm-workspace.yaml    # Workspace definition
└── package.json           # Root scripts (build:all, dev:all)
```

## 3. The Power of Shared Code (`packages/shared`)
The biggest pain point currently is maintaining two sets of interfaces for the same data.

- **Current State**: You modify `order.entity.ts`, then manually update `order.service.ts` in backend, and then manually update `api.ts` in frontend.
- **Monorepo State**:
  1. Define `OrderInfo` in `packages/shared`.
  2. `api-admin` uses it for the response type.
  3. `web-store` (Astro) uses it to render the order card.
  4. Changes in one place trigger type errors in others instantly.

## 4. Astro Storefront (Nike Design) Implementation Strategy
Since the goal is a "Nike-like" experience:
- **Design Tokens**: Centralize colors (Nike Black, Pure White, Wolf Grey) in `packages/ui-theme`.
- **Performance**: Astro's partial hydration is perfect. PLP (Product List Page) will be mostly static (SSR/SSG), while the Cart/Checkout will be "Islands" using React components.
- **DTO Usage**: The `web-store` will directly import `ProductDto` from `@app/shared` for fetching data from `api-store`.

## 5. Transition Steps (Phase by Phase)
### Phase 1: Environment Preparation
- Initialize `pnpm-workspace.yaml` at the root.
- Move `frond/admin-web` into `apps/web-admin`.
- Move `backend` sub-apps into `apps/` and `backend/libs` into `packages/`.
- Fix `tsconfig` paths to use package names (e.g., `@app/db`, `@app/shared`).

### Phase 2: Building the Storefront
- Scaffold Astro project in `apps/web-store`.
- Implement Nike-inspired UI components using the shared theme.

### Phase 3: Unification
- Extract shared logic from APIs into `packages/shared`.
- Update `web-admin` to use shared DTOs instead of local definitions.
