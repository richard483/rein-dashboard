import { writable, derived } from 'svelte/store';
import type { UserInfo, LoginRequest, LoginResponse, ApiError } from '../types';
import { api, setTokens, clearTokens, getAccessToken } from '../api/client';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    // Login
    login: async (credentials: LoginRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<LoginResponse>('/auth/login', credentials);

        setTokens(response.access_token, response.refresh_token);

        update((state) => ({
          ...state,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        update((state) => ({
          ...state,
          isLoading: false,
          error: apiError
        }));
        throw apiError;
      }
    },

    // Logout
    logout: async () => {
      try {
        // Optional: call logout endpoint if needed
        // await api.post('/auth/logout', { refresh_token: getRefreshToken() });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearTokens();
        set(initialState);
      }
    },

    // Get current user profile
    fetchUser: async () => {
      const token = getAccessToken();
      if (!token) {
        set(initialState);
        return null;
      }

      update((state) => ({ ...state, isLoading: true }));

      try {
        const user = await api.get<UserInfo>('/auth/me');

        update((state) => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));

        return user;
      } catch (error) {
        const apiError = error as ApiError;
        clearTokens();
        update((state) => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: apiError
        }));
        return null;
      }
    },

    // Initialize auth state (check if user is logged in)
    init: async () => {
      const token = getAccessToken();
      if (!token) {
        set(initialState);
        return;
      }

      try {
        const user = await api.get<UserInfo>('/auth/me');
        update((state) => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } catch (error) {
        clearTokens();
        set(initialState);
      }
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    }
  };
}

export const authStore = createAuthStore();

// Derived stores
export const currentUser = derived(authStore, ($auth) => $auth.user);

export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);

export const isSuperAdmin = derived(authStore, ($auth) => {
  if (!$auth.user || !$auth.user.roles) return false;
  return $auth.user.roles.some((role) => role.toLowerCase() === 'superadmin');
});

export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

export const authError = derived(authStore, ($auth) => $auth.error);
