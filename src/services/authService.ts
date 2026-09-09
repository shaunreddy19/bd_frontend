import { request } from './apiClient.ts';

export interface User {
  id: string;
  name: string;
  testIdentityNumber: string;
  mobileNumber: string;
  role: 'CITIZEN' | 'RESCUER';
  households?: any[];
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  getStoredUser(): User | null {
    try {
      const u = localStorage.getItem('stride_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('stride_token');
    localStorage.removeItem('stride_user');
  },

  async signup(data: {
    name: string;
    testIdentityNumber: string;
    mobileNumber: string;
    password?: string;
    role?: 'CITIZEN' | 'RESCUER';
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        password: data.password || 'stride123',
      }),
    });
    if (res.token) {
      localStorage.setItem('stride_token', res.token);
      localStorage.setItem('stride_user', JSON.stringify(res.user));
    }
    return res;
  },

  async login(data: {
    testIdentityNumber?: string;
    mobileNumber?: string;
    name?: string;
    password?: string;
    role?: 'CITIZEN' | 'RESCUER';
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        password: data.password || 'stride123',
      }),
    });
    if (res.token) {
      localStorage.setItem('stride_token', res.token);
      localStorage.setItem('stride_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },
};
