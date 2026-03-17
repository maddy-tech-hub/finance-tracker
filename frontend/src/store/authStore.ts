import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  fullName: string | null;
  setAuth: (payload: { accessToken: string; refreshToken: string; fullName: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  fullName: localStorage.getItem("full_name"),
  setAuth: ({ accessToken, refreshToken, fullName }) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("full_name", fullName);
    set({ accessToken, refreshToken, fullName });
  },
  logout: () => {
    localStorage.clear();
    set({ accessToken: null, refreshToken: null, fullName: null });
  }
}));
