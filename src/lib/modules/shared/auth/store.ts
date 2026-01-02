import { writable, derived } from 'svelte/store';
import type { UserInfo, LoginRequest, LoginResponse, ApiError, AuthState, ProfileResponse, ApiResponse } from '../types';
import { api, setTokens, clearTokens, getAccessToken } from '../api/client';


const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isLoading: false,
  error: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Define fetchUser first so we can reference it in init
  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      set(initialState);
      return null;
    }

    update((state) => ({ ...state, isLoading: true }));

    try {
      const profile = await api.get<ProfileResponse>('/auth/me');

      update((state) => ({
        ...state,
        user: {
          id: profile.user_id,
          username: profile.username,
          is_active: true, // Assuming active if they can call /auth/me
          roles: profile.roles
        },
        isAuthenticated: true,
        isSuperAdmin: profile.roles.some(r => r.toLowerCase() === 'superadmin'),
        isLoading: false,
        error: null
      }));

      return profile;
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
  };

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
          user: {
            id: response.user.id,
            username: response.user.username,
            is_active: response.user.is_active,
            roles: [] // Will be populated by fetchUser
          },
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          isAuthenticated: true,
          isSuperAdmin: false,
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
    fetchUser,

    // Initialize auth state (check if user is logged in)
    init: async () => {
      const token = getAccessToken();
      if (!token) {
        set(initialState);
        return;
      }

      // Use fetchUser to properly initialize with roles and permissions
      await fetchUser();
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
  return $auth.user.roles.some((role: string) => role.toLowerCase() === 'superadmin');
});

export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

export const authError = derived(authStore, ($auth) => $auth.error);
