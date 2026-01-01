import { api } from '$lib/modules/shared/api/client';
import type { Permission, CreatePermissionRequest, ApiResponse, ListPermissionsResponse } from '$lib/modules/shared/types';

/**
 * Permission Management API Service
 */

// List all permissions
export async function listPermissions(): Promise<ListPermissionsResponse> {
  return api.get<ListPermissionsResponse>('/admin/permissions');
}

// Create a new permission
export async function createPermission(data: CreatePermissionRequest): Promise<ApiResponse> {
  return api.post<ApiResponse>('/admin/permissions', data);
}

// Delete permission
export async function deletePermission(id: string): Promise<ApiResponse> {
  return api.delete<ApiResponse>(`/admin/permissions/${id}`);
}
