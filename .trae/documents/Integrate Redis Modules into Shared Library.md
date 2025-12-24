# Implementation Plan: Integrate Redis Modules

## Overview

We will extract the `RedisClientModule` and `RedisLockModule` from `sem-api` and integrate them into the shared `libs` directory. This allows reusability across all applications in the monorepo (e.g., `cms-admin-api`).

是基于nestjs cache manage 的， 所有要把这个 也集成进来。

## Steps

### 1. Create Shared Redis Library (`libs/redis`)

* Create `libs/redis/src/`

* Create `libs/redis/src/client/` (for `RedisClientModule`)

* Create `libs/redis/src/lock/` (for `RedisLockModule`)

### 2. Migrate RedisClient

* Copy `RedisClientService` to `libs/redis/src/client/redis-client.service.ts`

* Copy `RedisClientModule` to `libs/redis/src/client/redis-client.module.ts`

* Update imports to use relative paths or standard lib paths.

* **Dependency**: Ensure `@nestjs/cache-manager`, `cache-manager`, `@keyv/redis`, `keyv` are available (already checked in `package.json`).

### 3. Migrate RedisLock

* Copy `RedisLockService` to `libs/redis/src/lock/redis-lock.service.ts`

* Copy `RedisLockModule` to `libs/redis/src/lock/redis-lock.module.ts`

* Update imports to use `RedisClientModule` from `../client`.

### 4. Export Modules

* Create `libs/redis/src/index.ts` to export everything.

### 5. Integrate into `cms-admin-api`

* Update `SystemConfigService` to use `RedisClientService` from `libs/redis` instead of direct `createClient`.

* *Note*: `SystemConfigService` currently uses `node-redis` (`createClient`) directly for Pub/Sub. The `RedisClientService` from `sem-api` retrieves the underlying client from `cache-manager` -> `keyv` -> `ioredis`/`node-redis`.

* We need to check if the `RedisClientService` exposes a client compatible with what `SystemConfigService` needs (Pub/Sub). `KeyvRedis` typically uses `ioredis` or `node-redis`. The `getClient()` returns `RedisClientConnectionType`.

* **Refinement**: `SystemConfigService` needs two connections (one for Pub, one for Sub). The `RedisClientService` provides *one* shared client.

* **Decision**: For Pub/Sub in `SystemConfigService`, we should duplicate the client or create new connections. The `RedisClientService` exposes the underlying client. We can use it to `duplicate()` if it supports it, or just use `RedisClientService` for general caching and keep `SystemConfigService`'s specialized Pub/Sub logic (maybe refactored to use the config from the lib).

* **Better Approach**: Let's first just migrate the modules to `libs` as requested. Then we can optionally refactor `SystemConfigService` to use it, or at least have the modules available for future use (like locking).

### 6. Update `SystemConfigService` (Optional but recommended)

* The user asked to "integrate into the project".

* We will focus on creating the `libs/redis` first.

* Then we can show how to use it.

## Verification

* Verify `libs/redis` compiles.

* Check if `cms-admin-api` can import from `@app/redis` (need to update `tsconfig.json` paths if not auto-mapped, but NestJS CLI usually handles `libs` mapping).

## File Structure Plan

```
libs/
  redis/
    src/
      client/
        redis-client.module.ts
        redis-client.service.ts
      lock/
        redis-lock.module.ts
        redis-lock.service.ts
      index.ts
    tsconfig.lib.json
```

