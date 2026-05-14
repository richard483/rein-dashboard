import { writable, derived } from 'svelte/store';
import type { 
  UserInfo, 
  LoginRequest, 
  LoginResponse, 
  ApiError, 
  AuthState, 
  ProfileResponse, 
  ApiResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse
} from '../types';
import { api, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/client';


const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isInitialized: false,
  isLoading: true,
  error: null
};

const unauthenticatedState: AuthState = {
  ...initialState,
  isInitialized: true,
  isLoading: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Define fetchUser first so we can reference it in init
  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      set(unauthenticatedState);
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
        isInitialized: true,
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
        isSuperAdmin: false,
        isInitialized: true,
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
          isInitialized: true,
          isLoading: true,
          error: null
        }));

        await fetchUser();

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        update((state) => ({
          ...state,
          isLoading: false,
          isInitialized: true,
          error: apiError
        }));
        throw apiError;
      }
    },

    // Logout
    logout: async () => {
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          await api.post('/auth/logout', { refresh_token: refreshToken });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearTokens();
        set(unauthenticatedState);
      }
    },

    // Get current user profile
    fetchUser,

    // Initialize auth state (check if user is logged in)
    init: async () => {
      const token = getAccessToken();
      if (!token) {
        set(unauthenticatedState);
        return;
      }

      // Use fetchUser to properly initialize with roles and permissions
      await fetchUser();
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    },

    // Register new user
    register: async (data: RegisterRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

    // Verify email
    verifyEmail: async (data: VerifyEmailRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

    // Resend verification email
    resendVerification: async (data: ResendVerificationRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<ResendVerificationResponse>('/auth/resend-verification', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

    // Forgot password
    forgotPassword: async (data: ForgotPasswordRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

    // Reset password
    resetPassword: async (data: ResetPasswordRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

    // Change password (requires authentication)
    changePassword: async (data: ChangePasswordRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await api.post<ChangePasswordResponse>('/auth/change-password', data);
        
        update((state) => ({ ...state, isLoading: false, error: null }));
        
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

export const isInitialized = derived(authStore, ($auth) => $auth.isInitialized);

export const authError = derived(authStore, ($auth) => $auth.error);
