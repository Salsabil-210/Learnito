import { api, endpoints } from './apiconfig';

// Types for API requests and responses
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Auth API functions
export const authAPI = {
  // Signup
  async signup(data: SignupData): Promise<UserResponse> {
    const response = await api.post(endpoints.auth.signup, data);
    return response.data;
  },

  // Login
  async login(data: LoginData): Promise<UserResponse> {
    const response = await api.post(endpoints.auth.login, data);
    return response.data;
  },

  // Refresh token (called automatically by interceptor)
  async refresh(): Promise<void> {
    await api.post(endpoints.auth.refresh);
  },

  // Logout
  async logout(): Promise<void> {
    await api.post(endpoints.auth.logout);
  },

  // Get current user profile
  async getProfile(): Promise<UserResponse> {
    const response = await api.get(endpoints.user.profile);
    return response.data;
  },
};
