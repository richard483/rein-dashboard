import { redirect } from '@sveltejs/kit';
import type { LoadEvent } from '@sveltejs/kit';
import { getAccessToken } from '../api/client';

/**
 * Auth guard for protected routes
 * Use this in +page.ts or +layout.ts load function
 */
export async function requireAuth(event: LoadEvent) {
  const token = getAccessToken();

  if (!token) {
    throw redirect(302, '/login');
  }
}

/**
 * Superadmin guard for admin routes
 * Use this in +page.ts or +layout.ts load function
 * Note: This requires the /auth/me endpoint to return user with roles
 */
export async function requireSuperAdmin(event: LoadEvent, userRoles?: string[]) {
  const token = getAccessToken();

  if (!token) {
    throw redirect(302, '/login');
  }

  // If roles are provided, check them
  if (userRoles) {
    const isSuperAdmin = userRoles.some((role) => role.toLowerCase() === 'superadmin');
    if (!isSuperAdmin) {
      throw redirect(302, '/unauthorized');
    }
  }
}

/**
 * Guest guard - redirect authenticated users
 * Use this for login/register pages
 */
export async function requireGuest(event: LoadEvent) {
  const token = getAccessToken();

  if (token) {
    throw redirect(302, '/');
  }
}
