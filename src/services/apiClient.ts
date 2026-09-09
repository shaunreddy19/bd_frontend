/**
 * STRIDE API Client
 * Centralized HTTP request utility with JWT authentication and consistent error handling.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('stride_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized, notify session expired
      if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
        localStorage.removeItem('stride_token');
        localStorage.removeItem('stride_user');
        window.dispatchEvent(new Event('stride_auth_expired'));
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network communication failure.', 0);
  }
}
