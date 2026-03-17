import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5213";

export const api = axios.create({
  baseURL: `${API_URL}/api`
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config;
    if (!original) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            try {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      refreshing = true;
      try {
        const accessToken = localStorage.getItem("access_token") ?? "";
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          accessToken,
          refreshToken
        });

        const payload = response.data?.data;
        if (!payload?.accessToken || !payload?.refreshToken) {
          throw new Error("Invalid refresh response");
        }

        localStorage.setItem("access_token", payload.accessToken);
        localStorage.setItem("refresh_token", payload.refreshToken);

        queue.forEach((cb) => cb(payload.accessToken));
        queue = [];

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${payload.accessToken}`;
        return api(original);
      } catch (refreshError) {
        queue = [];
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
