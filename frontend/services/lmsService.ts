import apiClient from './apiClient';

export const lmsService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/users/stats'); // Use existing stats endpoint
    return response.data;
  },

  // Cohorts
  getCohorts: async () => {
    const response = await apiClient.get('/cohorts');
    return response.data;
  },

  getActiveCohort: async () => {
    const response = await apiClient.get('/cohorts/current-active');
    return response.data;
  },

  getCohortById: async (id: string) => {
    const response = await apiClient.get(`/cohorts/${id}`);
    return response.data;
  },

  createCohort: async (cohortData: {
    name: string;
    cohortNumber: number;
    tracks: string[];
    startDate: string;
    endDate: string;
    status: string;
    maxStudents: number;
    description?: string;
  }) => {
    const response = await apiClient.post('/cohorts', cohortData);
    return response.data;
  },

  setActiveCohort: async (cohortId: string) => {
    const response = await apiClient.patch(`/cohorts/${cohortId}`, {
      isActive: true,
    });
    return response.data;
  },

  deleteCohort: async (cohortId: string) => {
    const response = await apiClient.delete(`/cohorts/${cohortId}`);
    return response.data;
  },

  updateCohort: async (
    cohortId: string,
    cohortData: {
      name: string;
      tracks: string[];
      startDate: string;
      endDate: string;
      status: string;
    }
  ) => {
    const response = await apiClient.put(`/cohorts/${cohortId}`, cohortData);
    return response.data;
  },

  // Students
  getStudents: async (params?: {
    cohortId?: string;
    trackId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/users/students', { params });
    return response.data;
  },

  getStudent: async (studentId: string) => {
    const response = await apiClient.get(`/users/students/${studentId}`);
    return response.data;
  },

  getStudentsByCohort: async (
    cohortId: string,
    params?: {
      trackId?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const response = await apiClient.get(`/users/students/cohort/${cohortId}`, {
      params,
    });
    return response.data;
  },

  assignTrackToStudent: async (
    studentId: string,
    data: {
      trackId: string;
      cohortId: string;
    }
  ) => {
    const response = await apiClient.patch(
      `/users/students/${studentId}/assign-track`,
      data
    );
    return response.data;
  },

  // Announcements (using streams with type 'announcement')
  getAnnouncements: async (cohortId: string, trackId?: string) => {
    const response = await apiClient.get('/streams', {
      params: {
        cohortId,
        trackId,
        type: 'announcement',
      },
    });
    return response.data;
  },

  createAnnouncement: async (data: {
    cohortId: string;
    trackId: string;
    title: string;
    content: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    const response = await apiClient.post('/streams', {
      ...data,
      type: 'announcement',
    });
    return response.data;
  },
};
