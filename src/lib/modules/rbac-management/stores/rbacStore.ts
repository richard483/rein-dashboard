import { writable, derived } from 'svelte/store';
import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  ApiError
} from '$lib/modules/shared/types';
import * as roleApi from '../api/roleApi';
import * as permissionApi from '../api/permissionApi';

interface RoleState {
  roles: Role[];
  currentRole: Role | null;
  loading: boolean;
  error: ApiError | null;
}

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: ApiError | null;
}

const initialRoleState: RoleState = {
  roles: [],
  currentRole: null,
  loading: false,
  error: null
};

const initialPermissionState: PermissionState = {
  permissions: [],
  loading: false,
  error: null
};

/**
 * Role Store
 */
function createRoleStore() {
  const { subscribe, set, update } = writable<RoleState>(initialRoleState);

  return {
    subscribe,

    // Fetch all roles
    fetchRoles: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const roles = await roleApi.listRoles();

        update((state) => ({
          ...state,
          roles,
          loading: false
        }));

        return roles;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error as ApiError
        }));
        throw error;
      }
    },

    // Fetch role by ID
    fetchRole: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const role = await roleApi.getRoleById(id);

        update((state) => ({
          ...state,
          currentRole: role,
          loading: false
        }));

        return role;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error as ApiError
        }));
        throw error;
      }
    },

    // Create new role
    createRole: async (data: CreateRoleRequest) => {
      try {
        await roleApi.createRole(data);
      } catch (error) {
        throw error;
      }
    },

    // Update role
    updateRole: async (id: string, data: UpdateRoleRequest) => {
      try {
        await roleApi.updateRole(id, data);
        // Update local state
        update((state) => ({
          ...state,
          currentRole: state.currentRole
            ? { ...state.currentRole, name: data.name, description: data.description || '' }
            : null
        }));
      } catch (error) {
        throw error;
      }
    },

    // Delete role
    deleteRole: async (id: string) => {
      try {
        await roleApi.deleteRole(id);
        // Remove from local state
        update((state) => ({
          ...state,
          roles: state.roles.filter((r) => r.id !== id)
        }));
      } catch (error) {
        throw error;
      }
    },

    // Assign permissions to role
    assignPermissions: async (roleId: string, permissionIds: string[]) => {
      try {
        await roleApi.assignPermissionsToRole(roleId, permissionIds);
        // Refresh current role to get updated permissions
        await roleStore.fetchRole(roleId);
      } catch (error) {
        throw error;
      }
    },

    // Remove permission from role
    removePermission: async (roleId: string, permissionId: string) => {
      try {
        await roleApi.removePermissionFromRole(roleId, permissionId);
        // Update local state
        update((state) => ({
          ...state,
          currentRole: state.currentRole
            ? {
              ...state.currentRole,
              permissions: state.currentRole.permissions?.filter((p) => p.id !== permissionId)
            }
            : null
        }));
      } catch (error) {
        throw error;
      }
    },

    // Reset store
    reset: () => {
      set(initialRoleState);
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    }
  };
}

/**
 * Permission Store
 */
function createPermissionStore() {
  const { subscribe, set, update } = writable<PermissionState>(initialPermissionState);

  return {
    subscribe,

    // Fetch all permissions
    fetchPermissions: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const permissions = await permissionApi.listPermissions();

        update((state) => ({
          ...state,
          permissions,
          loading: false
        }));

        return permissions;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error as ApiError
        }));
        throw error;
      }
    },

    // Create new permission
    createPermission: async (data: CreatePermissionRequest) => {
      try {
        await permissionApi.createPermission(data);
      } catch (error) {
        throw error;
      }
    },

    // Delete permission
    deletePermission: async (id: string) => {
      try {
        await permissionApi.deletePermission(id);
        // Remove from local state
        update((state) => ({
          ...state,
          permissions: state.permissions.filter((p) => p.id !== id)
        }));
      } catch (error) {
        throw error;
      }
    },

    // Reset store
    reset: () => {
      set(initialPermissionState);
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    }
  };
}

// Create store instances
export const roleStore = createRoleStore();
export const permissionStore = createPermissionStore();

// Derived stores
export const roles = derived(roleStore, ($store) => $store.roles);
export const currentRole = derived(roleStore, ($store) => $store.currentRole);
export const rolesLoading = derived(roleStore, ($store) => $store.loading);

export const permissions = derived(permissionStore, ($store) => $store.permissions);
export const permissionsLoading = derived(permissionStore, ($store) => $store.loading);
