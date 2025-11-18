import apiClient from "./apiClient";

export const authService = {
  login: async (email: string, password: string) => {
    return apiClient.post("/auth/login", { email, password });
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    return apiClient.post("/auth/register", userData);
  },

  forgotPassword: async (email: string) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiClient.post("/auth/reset-password", { token, newPassword });
  },

  logout: async () => {
    return apiClient.post("/auth/logout");
  },

  getCurrentUser: async () => {
    return apiClient.get("/auth/profile");
  },

  refreshToken: async () => {
    return apiClient.post("/auth/refresh-token");
  },
};
