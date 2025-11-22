import apiClient from './apiClient';

export const userService = {
  // Get all users with optional role filtering (no pagination)
  getAllUsers: async (params?: { role?: string | string[]; isActive?: boolean }) => {
    const queryParams = new URLSearchParams();

    if (params?.role) {
      const roles = Array.isArray(params.role)
        ? params.role.join(',')
        : params.role;
      queryParams.append('role', roles);
    }

    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }

    return apiClient.get(`/users?${queryParams.toString()}`);
  },
  // Get users with pagination
  getUsers: async (params?: {
    role?: string | string[];
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.role) {
      const roles = Array.isArray(params.role)
        ? params.role.join(',')
        : params.role;
      queryParams.append('role', roles);
    }

    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    return apiClient.get(`/users?${queryParams.toString()}`);
  },

  // Get mentors only
  getMentors: async () => {
    return apiClient.get('/users/mentors');
  },

  // Get user by ID
  getUserById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  // Create new user
  createUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    country: string;
    state: string;
    role: string;
    assignedTracks?: string[];
  }) => {
    return apiClient.post('/users', userData);
  },

  // Update user
  updateUser: async (id: string, userData: any) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  // Toggle user status
  toggleUserStatus: async (id: string) => {
    return apiClient.patch(`/users/${id}/toggle-status`);
  },

  // Assign tracks to mentor
  assignTracksToMentor: async (id: string, trackIds: string[]) => {
    return apiClient.patch(`/users/${id}/assign-tracks`, { trackIds });
  },

  // Delete user
  deleteUser: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};
