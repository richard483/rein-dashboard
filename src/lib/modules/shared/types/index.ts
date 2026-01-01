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
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// User Types
export interface User {
  id: string;
  username: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  roles?: { name: string }[]; // For superadmin check
}

export interface UserInfo {
  id: string;
  username: string;
  is_active: boolean;
  roles?: { name: string }[];
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

// Role Types
export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
  permissions?: Permission[];
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

// Permission Types
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface DeletePermissionRequest {
  id: string;
}

// User Role Types
export interface UserRole {
  role_id: string;
  role_name: string;
  is_system: boolean;
  description?: string;
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

// Authentication Types
export interface LoginRequest {
  user_name: string;
  pass_phrase: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
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

// Auth Store Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}
