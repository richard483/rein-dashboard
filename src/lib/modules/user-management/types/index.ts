// Re-export shared types that are commonly used in user management
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  UserRole,
  UserPermission,
  AssignRolesRequest,
  PaginatedResponse,
  ApiError
} from '$lib/modules/shared/types';

// User management specific types can be added here if needed
export interface UserFormData {
  user_name: string;
  pass_phrase: string;
  confirm_password: string;
}

export interface UserUpdateFormData {
  user_name?: string;
  pass_phrase?: string;
  confirm_password?: string;
  is_active?: boolean;
}

export interface UserRoleAssignment {
  userId: string;
  roleIds: string[];
}
