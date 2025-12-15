import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

const authApi = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await authApi.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (data: { email: string; password: string; name: string }) => {
    const response = await authApi.post("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    const response = await authApi.post("/auth/logout");
    return response.data;
  },
};

export default api;