import { api } from "lib/apiClient";
import type { ApiResponse, AuthTokens } from "types/api";

export const authService = {
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", payload),
  forgotPassword: (payload: { email: string }) => api.post("/auth/forgot-password", payload),
  resetPassword: (payload: { token: string; newPassword: string }) => api.post("/auth/reset-password", payload)
};
