// Re-export shared types that are commonly used in RBAC management
export type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  AssignPermissionsRequest,
  ApiError
} from '$lib/modules/shared/types';

// RBAC management specific types
export interface RoleFormData {
  name: string;
  description: string;
}

export interface PermissionFormData {
  resource: string;
  action: string;
  description: string;
}

export interface RolePermissionAssignment {
  roleId: string;
  permissionIds: string[];
}
