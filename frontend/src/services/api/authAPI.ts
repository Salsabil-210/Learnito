
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

type ApiResult<T> = [ApiError, null] | [null, T];

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include", // Important for HttpOnly cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return [{ message: data.message || "Request failed", status: response.status }, null];
    }

    return [null, data as T];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return [{ message }, null];
  }
}

export const authAPI = {
  login(credentials: LoginCredentials): Promise<ApiResult<AuthResponse>> {
    return authFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  signup(credentials: SignupCredentials): Promise<ApiResult<AuthResponse>> {
    return authFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  googleAuth(credential: string): Promise<ApiResult<AuthResponse>> {
    return authFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },

  logout(): Promise<ApiResult<{ message: string }>> {
    return authFetch("/api/auth/logout", {
      method: "POST",
    });
  },

  refreshToken(): Promise<ApiResult<AuthResponse>> {
    return authFetch<AuthResponse>("/api/auth/refresh", {
      method: "POST",
    });
  },

  getProfile(): Promise<ApiResult<AuthResponse["user"]>> {
    return authFetch<AuthResponse["user"]>("/api/auth/profile", {
      method: "GET",
    });
  },
};