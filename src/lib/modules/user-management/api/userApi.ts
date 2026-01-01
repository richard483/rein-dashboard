import { api } from '$lib/modules/shared/api/client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  ListUsersResponse,
  UserRole,
  UserPermission,
  AssignRolesRequest,
  ApiResponse,
  GetUserRolesResponse,
  GetUserPermissionsResponse
} from '$lib/modules/shared/types';

/**
 * User Management API Service
 */

// List all users with pagination
export async function listUsers(page = 1, pageSize = 10): Promise<ListUsersResponse> {
  return api.get<ListUsersResponse>(`/user/data?page=${page}&page_size=${pageSize}`);
}

// Get user by ID
export async function getUserById(id: string): Promise<User> {
  return api.get<User>(`/user/data/${id}`);
}

// Create a new user
export async function createUser(data: CreateUserRequest): Promise<ApiResponse> {
  return api.post<ApiResponse>('/user/data', data);
}

// Create multiple users
export async function createBulkUsers(data: CreateUserRequest[]): Promise<ApiResponse> {
  return api.post<ApiResponse>('/user/data/bulk', data);
}

// Update user by ID
export async function updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse> {
  return api.put<ApiResponse>(`/user/data/${id}`, data);
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse> {
  return api.delete<ApiResponse>('/user/data', { id });
}

// Get user roles
export async function getUserRoles(userId: string): Promise<GetUserRolesResponse> {
  return api.get<GetUserRolesResponse>(`/admin/users/${userId}/roles`);
}

// Assign roles to user
export async function assignRolesToUser(
  userId: string,
  roleIds: string[]
): Promise<ApiResponse> {
  const data: AssignRolesRequest = { role_ids: roleIds };
  return api.post<ApiResponse>(`/admin/users/${userId}/roles`, data);
}

// Remove roles from user
export async function removeRolesFromUser(
  userId: string,
  roleIds: string[]
): Promise<ApiResponse> {
  const data: AssignRolesRequest = { role_ids: roleIds };
  return api.delete<ApiResponse>(`/admin/users/${userId}/roles`, data);
}

// Get user effective permissions
export async function getUserPermissions(userId: string): Promise<GetUserPermissionsResponse> {
  return api.get<GetUserPermissionsResponse>(`/admin/users/${userId}/permissions`);
}
