import { env } from '$env/dynamic/public';
import type { ApiResponse, ApiError, AppError } from '../types';

const API_BASE_URL = env.PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof localStorage !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken && typeof localStorage !== 'undefined') {
    refreshToken = localStorage.getItem('refresh_token');
  }
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// Request interceptor - adds auth header
function getHeaders(customHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>)
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Response error handler
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: ApiResponse | null = null;

    if (isJson) {
      try {
        errorData = await response.json();
      } catch {
        // Failed to parse JSON error
      }
    }

    const error: ApiError = {
      status: response.status,
      message: errorData?.message || response.statusText || 'An error occurred',
      error: errorData?.error
    };

    throw error;
  }

  if (isJson) {
    const data: ApiResponse<T> = await response.json();
    return data.data as T;
  }

  return {} as T;
}

async function handleRawResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: ApiResponse | null = null;
    if (isJson) {
      try {
        errorData = await response.json();
      } catch {
        // Failed to parse JSON error
      }
    }

    throw {
      status: response.status,
      message: errorData?.message || response.statusText || 'An error occurred',
      error: errorData?.error
    } as ApiError;
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return {} as T;
}

// Refresh token logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refresh })
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Token refresh failed');
  }

  const data: ApiResponse = await response.json();
  const newAccessToken = data.data.access_token;

  setTokens(newAccessToken, refresh);
  return newAccessToken;
}

// Main request function with retry logic
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: getHeaders(options.headers)
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && retry && getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          onTokenRefreshed(newToken);
          isRefreshing = false;

          // Retry original request with new token
          return request<T>(endpoint, options, false);
        } catch (error) {
          isRefreshing = false;
          clearTokens();
          // Redirect to login or throw error
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw error;
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            request<T>(endpoint, options, false).then(resolve).catch(reject);
          });
        });
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    // Network error or other unexpected error
    throw {
      status: 0,
      message: 'Network error or server is unreachable',
      error: String(error)
    } as ApiError;
  }
}

async function rawRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: getHeaders(options.headers)
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && retry && getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          onTokenRefreshed(newToken);
          isRefreshing = false;
          return rawRequest<T>(endpoint, options, false);
        } catch (error) {
          isRefreshing = false;
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw error;
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(() => {
          rawRequest<T>(endpoint, options, false).then(resolve).catch(reject);
        });
      });
    }

    return handleRawResponse<T>(response);
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error or server is unreachable',
      error: String(error)
    } as ApiError;
  }
}

// HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),

  rawGet: <T>(endpoint: string, options?: RequestInit) =>
    rawRequest<T>(endpoint, { ...options, method: 'GET' }),

  rawPost: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    rawRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body:
        data instanceof URLSearchParams
          ? data.toString()
          : data
            ? JSON.stringify(data)
            : undefined
    })
};

export default api;
