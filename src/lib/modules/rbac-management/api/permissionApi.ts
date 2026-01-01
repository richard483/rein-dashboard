import { api } from '$lib/modules/shared/api/client';
import type { Permission, CreatePermissionRequest, ApiResponse } from '$lib/modules/shared/types';

/**
 * Permission Management API Service
 */

// List all permissions
export async function listPermissions(): Promise<Permission[]> {
  const response = await api.get<ApiResponse>('/admin/permissions');
  return response.data as Permission[];
}

// Create a new permission
export async function createPermission(data: CreatePermissionRequest): Promise<ApiResponse> {
  return api.post<ApiResponse>('/admin/permissions', data);
}

// Delete permission
export async function deletePermission(id: string): Promise<ApiResponse> {
  return api.delete<ApiResponse>(`/admin/permissions/${id}`);
}
