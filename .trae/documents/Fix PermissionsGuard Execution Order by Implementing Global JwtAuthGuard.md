I have identified the issue: `PermissionsGuard` is running **before** `AuthGuard('jwt')` because `PermissionsGuard` is registered globally while `AuthGuard` is only applied at the controller level. This causes `request.user` to be undefined when `PermissionsGuard` executes.

Here is the plan to fix this by implementing a global authentication flow:

1. **Create Global JWT Guard** (`apps/cms-admin-api/src/auth/jwt-auth.guard.ts`):

   * Create a custom `JwtAuthGuard` extending `AuthGuard('jwt')`.

   * Implement logic to check for the `@Public()` decorator (using `Reflector`) to allow public access to login/register endpoints.

2. **Update Module Registration** (`apps/cms-admin-api/src/cms-admin-api.module.ts`):

   * Register `JwtAuthGuard` as a global guard (`APP_GUARD`) in the `providers` array.

   * **Crucial**: Ensure `JwtAuthGuard` is listed **before** `PermissionsGuard` in the providers list so it executes first.

3. **Mark Public Endpoints** (`apps/cms-admin-api/src/auth/auth.controller.ts`):

   * Add the `@Public()` decorator to the `login` and `register` methods in `AuthController`.

4. **Cleanup (Optional but recommended)**:

   * Remove the redundant `@UseGuards(AuthGuard('jwt'))` from `UserController`, `RoleController`, `MenuController`, etc., since the global guard will now handle protection.

This change ensures that:

1. Every request goes through `JwtAuthGuard` first.
2. If it's a public route (like login), it passes.
3. If it's a protected route, the token is validated, and `request.user` is populated.
4. Then `PermissionsGuard` runs, sees the populated `user`, and performs the role/permission check.

