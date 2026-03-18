import { api } from "lib/apiClient";
import type { ApiResponse, AuthTokens, UserProfile } from "types/api";

export const authService = {
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", payload),
  me: () => api.get<ApiResponse<UserProfile>>("/auth/me"),
  updateProfile: (payload: { firstName: string; lastName: string }) =>
    api.put<ApiResponse<UserProfile>>("/auth/me", payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse<object>>("/auth/change-password", payload),
  forgotPassword: (payload: { email: string }) =>
    api.post<ApiResponse<{ token: string; expiresAtUtc: string }>>("/auth/forgot-password", payload),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    api.post<ApiResponse<object>>("/auth/reset-password", payload)
};
