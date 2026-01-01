import { writable, derived } from 'svelte/store';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  Role,
  Permission,
  ApiError
} from '$lib/modules/shared/types';
import * as userApi from '../api/userApi';

interface UserListState {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
  error: ApiError | null;
}

interface UserDetailState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  error: ApiError | null;
}

const initialListState: UserListState = {
  users: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
  loading: false,
  error: null
};

const initialDetailState: UserDetailState = {
  user: null,
  roles: [],
  permissions: [],
  loading: false,
  error: null
};

/**
 * User List Store
 */
function createUserListStore() {
  const { subscribe, set, update } = writable<UserListState>(initialListState);

  return {
    subscribe,

    // Fetch users with pagination
    fetchUsers: async (page = 1, pageSize = 10) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const response = await userApi.listUsers(page, pageSize);

        update((state) => ({
          ...state,
          users: response.users,
          currentPage: response.page,
          totalPages: response.total_pages,
          totalItems: response.total,
          pageSize: response.page_size,
          loading: false
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error as ApiError
        }));
        throw error;
      }
    },

    // Create new user
    createUser: async (data: CreateUserRequest) => {
      try {
        await userApi.createUser(data);
      } catch (error) {
        throw error;
      }
    },

    // Delete user
    deleteUser: async (id: string) => {
      try {
        await userApi.deleteUser(id);
        // Remove from local state
        update((state) => ({
          ...state,
          users: state.users.filter((u) => u.ID !== id)
        }));
      } catch (error) {
        throw error;
      }
    },

    // Reset store
    reset: () => {
      set(initialListState);
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    }
  };
}

/**
 * User Detail Store
 */
function createUserDetailStore() {
  const { subscribe, set, update } = writable<UserDetailState>(initialDetailState);

  return {
    subscribe,

    // Fetch user by ID
    fetchUser: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const user = await userApi.getUserById(id);

        update((state) => ({
          ...state,
          user,
          loading: false
        }));

        return user;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error as ApiError
        }));
        throw error;
      }
    },

    // Update user
    updateUser: async (id: string, data: UpdateUserRequest) => {
      try {
        await userApi.updateUser(id, data);
        // Update local state
        update((state) => ({
          ...state,
          user: state.user ? { ...state.user, ...data } : null
        }));
      } catch (error) {
        throw error;
      }
    },

    // Fetch user roles
    fetchUserRoles: async (userId: string) => {
      try {
        const response = await userApi.getUserRoles(userId);
        update((state) => ({ ...state, roles: response.roles }));
        return response.roles;
      } catch (error) {
        throw error;
      }
    },

    // Assign roles to user
    assignRoles: async (userId: string, roleIds: string[]) => {
      try {
        await userApi.assignRolesToUser(userId, roleIds);
        // Refresh roles
        await userDetailStore.fetchUserRoles(userId);
      } catch (error) {
        throw error;
      }
    },

    // Remove roles from user
    removeRoles: async (userId: string, roleIds: string[]) => {
      try {
        await userApi.removeRolesFromUser(userId, roleIds);
        // Refresh roles
        await userDetailStore.fetchUserRoles(userId);
      } catch (error) {
        throw error;
      }
    },

    // Fetch user permissions
    fetchUserPermissions: async (userId: string) => {
      try {
        const response = await userApi.getUserPermissions(userId);
        update((state) => ({ ...state, permissions: response.permissions }));
        return response.permissions;
      } catch (error) {
        throw error;
      }
    },

    // Reset store
    reset: () => {
      set(initialDetailState);
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    }
  };
}

// Create store instances
export const userListStore = createUserListStore();
export const userDetailStore = createUserDetailStore();

// Derived stores
export const users = derived(userListStore, ($store) => $store.users);
export const usersLoading = derived(userListStore, ($store) => $store.loading);
export const currentUser = derived(userDetailStore, ($store) => $store.user);
export const currentUserRoles = derived(userDetailStore, ($store) => $store.roles);
export const currentUserPermissions = derived(userDetailStore, ($store) => $store.permissions);
