import { api } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/register", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },

  async refreshToken(): Promise<void> {
    await api.post("/api/auth/refresh");
  },

  async getProfile(): Promise<AuthResponse["user"]> {
    const response = await api.get<{ user: AuthResponse["user"] }>("/api/auth/profile");
    return response.data.user;
  },
};