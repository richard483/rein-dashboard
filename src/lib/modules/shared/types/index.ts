// API Response Types
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// User Types (API uses Pascal case)
export interface User {
  ID: string;
  UserName: string;
  PassPhrase?: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  IsActive: boolean;
  FailedLoginAttempts: number;
  LockedUntil: string | null;
  Roles: Role[] | null;
}

// User Info from Login/Profile response
export interface UserInfo {
  id: string;
  username: string;
  is_active: boolean;
}

// Profile Response from /auth/me
export interface ProfileResponse {
  user_id: string;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface CreateUserRequest {
  user_name: string;
  pass_phrase: string;
}

export interface UpdateUserRequest {
  user_name?: string;
  pass_phrase?: string;
  is_active?: boolean;
}

export interface DeleteUserRequest {
  id: string;
}

// List Users Response
export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Role Types
export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface DeleteRoleRequest {
  id: string;
}

// List Roles Response
export interface ListRolesResponse {
  roles: Role[];
  total: number;
}

// Permission Types
export interface Permission {
  id: string;
  resource: string;
  action: string;
  permission_key: string;
  description: string;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface DeletePermissionRequest {
  id: string;
}

// List Permissions Response
export interface ListPermissionsResponse {
  permissions: Permission[];
  total: number;
}

// User Role Types
export interface UserRole {
  role_id: string;
  role_name: string;
  is_system: boolean;
  description?: string;
}

// Get User Roles Response
export interface GetUserRolesResponse {
  user_id: string;
  roles: Role[];
}

// Get User Permissions Response
export interface GetUserPermissionsResponse {
  user_id: string;
  permissions: Permission[];
}

export interface AssignRolesRequest {
  role_ids: string[];
}

export interface RemoveRolesRequest {
  role_ids: string[];
}

// User Permission Types
export interface UserPermission {
  permission_id: string;
  resource: string;
  action: string;
  source: string; // e.g., "role:admin"
  description?: string;
  source_role?: string;
}

// Role Permission Types
export interface AssignPermissionsRequest {
  permission_ids: string[];
}

// Session Types
export interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
}

export interface GetSessionsResponse {
  sessions: Session[];
  count: number;
}

// Authentication Types
export interface LoginRequest {
  user_name: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  session_id: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  error?: string;
}

export interface AppError extends Error {
  status?: number;
  data?: any;
}

// Auth Store Types (using transformed camelCase for internal use)
export interface AuthState {
  user: {
    id: string;
    username: string;
    is_active: boolean;
    roles?: string[];  // From profile endpoint
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Helper type for transformed user (for UI consumption)
export interface TransformedUser {
  id: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  roles?: Role[] | null;
}

// Helper functions for transforming API responses
export function transformUser(user: User): TransformedUser {
  return {
    id: user.ID,
    username: user.UserName,
    is_active: user.IsActive,
    created_at: user.CreatedAt,
    updated_at: user.UpdatedAt,
    deleted_at: user.DeletedAt,
    failed_login_attempts: user.FailedLoginAttempts,
    locked_until: user.LockedUntil,
    roles: user.Roles
  };
}

export function transformUserInfo(user: UserInfo): { id: string; username: string; is_active: boolean; roles?: string[] } {
  return {
    id: user.id,
    username: user.username,
    is_active: user.is_active,
    roles: []
  };
}
