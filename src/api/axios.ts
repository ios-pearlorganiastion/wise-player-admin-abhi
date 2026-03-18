import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://api.wise-player.com").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch a custom event so React components can listen and react
      // The AuthContext will catch this and naturally log out the user.
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  }
);
