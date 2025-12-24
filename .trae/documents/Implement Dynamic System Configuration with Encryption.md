# Implementation Plan: System Configuration Module

## Backend Implementation

### 1. Database Entity (`libs/db`)
- Create `SystemConfigEntity` (`sys_config`):
  - `id`: number (PK)
  - `key`: string (Unique, e.g., `oss.accessKeyId`)
  - `value`: string (Encrypted content if sensitive)
  - `group`: string (e.g., `oss`, `payment`, `system`)
  - `isEncrypted`: boolean (Flag to indicate if value is encrypted)
  - `description`: string (Optional)

### 2. System Config Module (`apps/cms-admin-api/src/system-config`)
- **Module**: `SystemConfigModule` (Global)
- **Service**: `SystemConfigService`
  - `onModuleInit()`: Load all configs from DB into a memory cache.
  - `encrypt(text: string)`: Helper to encrypt values using a derived key from `APP_SECRET` or a fixed salt.
  - `decrypt(text: string)`: Helper to decrypt values.
  - `get(key: string)`: Retrieve config value (decrypted if needed) from cache.
  - `set(key: string, value: string, isEncrypted: boolean)`: Update DB and refresh cache.
  - `refreshCache()`: Reload all configs from DB.
- **Controller**: `SystemConfigController`
  - `GET /system-config`: List all configs (Mask sensitive values as `******`).
  - `POST /system-config`: Create new config.
  - `PUT /system-config/:id`: Update config (If value is `******`, ignore update; else encrypt and save).
  - `DELETE /system-config/:id`: Delete config.
  - `POST /system-config/refresh`: Force refresh cache.

### 3. Integration with NestJS Config
- Since `ConfigService` is static after bootstrap, we will rely on `SystemConfigService` for dynamic values.
- However, to support the user's request of "loading into ConfigService", we can:
  - In `onModuleInit` of `SystemConfigService`, iterate through loaded configs and try to set them into `process.env` (runtime only) or just encourage using `SystemConfigService.get()`.
  - *Better approach*: We will stick to `SystemConfigService.get()` for dynamic configs, as it's the architectural best practice for values that change at runtime. We will provide a helper to expose these to the app.

## Frontend Implementation

### 1. Feature Module (`features/system-config`)
- **API Client**: Endpoints for CRUD.
- **Components**:
  - `SystemConfigList`: Table with "Group" tabs.
  - `ConfigDialog`: Form to Add/Edit.
    - Fields: Key, Value, Group, IsEncrypted (Switch), Description.
    - Logic: If `isEncrypted` is true, the input type should be `password`.

### 2. Routing & Menu
- Route: `/system/config`
- Menu: Add under "System Management".

## Verification
- Verify encryption in DB (check raw SQL).
- Verify decryption in API response (should be masked) and internal usage (should be clear text).
- Verify cache update on modification.
