import axiosClient from '@/lib/axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  message: string;
}

const AUTH_BASE = 'api/public/auth';

export const authApi = {
  login: (data: LoginPayload) =>
    axiosClient.post<TokenResponse>(`${AUTH_BASE}/login`, data),

  register: (data: RegisterPayload) =>
    axiosClient.post<string>(`${AUTH_BASE}/register`, data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    axiosClient.post<string>(`${AUTH_BASE}/forgot-password`, data),

  resetPassword: (data: ResetPasswordPayload) =>
    axiosClient.post<string>(`${AUTH_BASE}/reset-password`, data),

  logout: () =>
    axiosClient.post<string>(`${AUTH_BASE}/logout`),
};
