import { getAuthToken, clearAuthToken } from "./auth-helper";

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token is invalid, clear it and redirect to login
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();