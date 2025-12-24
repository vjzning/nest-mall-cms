# Implementation Plan: Storage Module with Multi-Driver Support

## Overview
Refactor `StorageService` to support multiple drivers (Local, Aliyun OSS, AWS S3) based on system configuration. The driver selection and configuration will be dynamic using `SystemConfigService`.

## Backend Implementation (`libs/storage`)

### 1. Update Dependencies
- Add `ali-oss` for Aliyun OSS.
- Add `@aws-sdk/client-s3` for AWS S3.

### 2. Implement Drivers
- **Interface**: Maintain `StorageDriver` interface.
- **Aliyun OSS Driver**: Implement `AliyunOssDriver` in `drivers/aliyun-oss.driver.ts`.
- **AWS S3 Driver**: Implement `AwsS3Driver` in `drivers/aws-s3.driver.ts`.
- **Driver Factory**: Create a factory or manager in `StorageService` to instantiate/switch drivers based on config.

### 3. Refactor `StorageService`
- Inject `SystemConfigService`.
- Implement logic to load driver configuration from `SystemConfigService` (`storage.driver`, `storage.oss.*`, `storage.s3.*`).
- Maintain a current driver instance.
- Add method to reload driver when config changes (subscribe to `SystemConfigService` changes or check on each request - likely subscription or simple check if we want hot-swapping).
- `upload` method should use the currently active driver.
- `remove` method should ideally use the driver specified in the `ResourceEntity` (stored in `driver` column) to ensure files uploaded to OSS are deleted from OSS even if current driver is S3.

### 4. Configuration Keys (System Config)
Define necessary keys:
- `storage.active_driver`: `local` | `aliyun-oss` | `aws-s3`
- `storage.oss.region`, `storage.oss.accessKeyId`, `storage.oss.accessKeySecret`, `storage.oss.bucket`
- `storage.s3.region`, `storage.s3.accessKeyId`, `storage.s3.secretAccessKey`, `storage.s3.bucket`

## Frontend Implementation (`apps/admin-web`)

### 1. Storage Configuration Page
- Extend `SystemConfig` feature or create a specific settings UI?
  - Since we already have a generic `SystemConfigList` that supports grouping, we can just use that.
  - We just need to guide the user to add these specific keys.
  - **Better UX**: Create a specific "Storage Settings" tab or page in Resource Management that abstracts the keys into a form.
  - Let's update `ResourceList` or add a "Settings" button that opens a dialog to configure storage.

### 2. UI Updates
- In `ResourceList`, show which driver a file belongs to (Badge/Icon).
- Add a "Storage Settings" dialog/page to easily switch drivers and input credentials.

## Plan Steps

1.  **Backend**: Install SDKs.
2.  **Backend**: Create `AliyunOssDriver` and `AwsS3Driver`.
3.  **Backend**: Update `StorageService` to use `SystemConfigService` and handle driver switching.
4.  **Backend**: Update `StorageService.remove` to use the correct driver based on resource record.
5.  **Frontend**: Add Storage Settings Dialog in Resource page.

