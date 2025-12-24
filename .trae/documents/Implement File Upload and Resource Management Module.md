# Implementation Plan: File Upload & Resource Management

## Backend Implementation

### 1. Update Storage Service (`libs/storage`)
- Add `remove(id: number)` method to `StorageService`.
  - Logic: Find resource by ID -> Delete file using driver -> Delete database record.

### 2. Create Resource Module (`apps/cms-admin-api`)
- Create `src/resource/resource.module.ts`.
- Create `src/resource/resource.controller.ts`:
  - `GET /resource`: List resources with pagination and optional filename search.
  - `DELETE /resource/:id`: Delete a resource.
- Create `src/resource/resource.service.ts`:
  - Implement `findAll` with pagination.
- Register `ResourceModule` in `CmsAdminApiModule`.

## Frontend Implementation

### 1. Feature Implementation (`apps/admin-web/src/features/resource`)
- **API Client (`api.ts`)**:
  - `findAll`: Fetch resource list.
  - `remove`: Delete resource.
  - `upload`: Upload file (reuse existing `/upload` endpoint).
- **Components**:
  - `ResourceList`: Main page displaying resources in a grid layout (cards with thumbnails).
  - `UploadDialog`: A dialog containing a file dropzone for uploading new files.
  - `ResourceCard`: Individual item component with preview, copy link, and delete actions.

### 2. Routing
- Create route files:
  - `src/routes/_auth.resource.tsx`
  - `src/routes/_auth.resource.lazy.tsx`

### 3. Menu & Permissions
- Create a seed script to add "Resource Management" menu to the "Content Management" section.
- Add corresponding permissions (`query`, `upload`, `delete`).

## Verification
- Verify upload functionality.
- Verify list display and pagination.
- Verify file deletion (both DB and disk).
