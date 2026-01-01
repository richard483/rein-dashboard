import { api } from '$lib/modules/shared/api/client';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  ApiResponse
} from '$lib/modules/shared/types';

/**
 * Role Management API Service
 */

// List all roles
export async function listRoles(): Promise<Role[]> {
  const response = await api.get<ApiResponse>('/admin/roles');
  return response.data as Role[];
}

// Get role by ID
export async function getRoleById(id: string): Promise<Role> {
  const response = await api.get<ApiResponse>(`/admin/roles/${id}`);
  return response.data as Role;
}

// Create a new role
export async function createRole(data: CreateRoleRequest): Promise<ApiResponse> {
  return api.post<ApiResponse>('/admin/roles', data);
}

// Update role
export async function updateRole(id: string, data: UpdateRoleRequest): Promise<ApiResponse> {
  return api.put<ApiResponse>(`/admin/roles/${id}`, data);
}

// Delete role
export async function deleteRole(id: string): Promise<ApiResponse> {
  return api.delete<ApiResponse>(`/admin/roles/${id}`);
}

// Assign permissions to role
export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[]
): Promise<ApiResponse> {
  const data: AssignPermissionsRequest = { permission_ids: permissionIds };
  return api.post<ApiResponse>(`/admin/roles/${roleId}/permissions`, data);
}

// Remove permission from role
export async function removePermissionFromRole(
  roleId: string,
  permissionId: string
): Promise<ApiResponse> {
  return api.delete<ApiResponse>(`/admin/roles/${roleId}/permissions/${permissionId}`);
}
