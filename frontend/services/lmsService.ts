import apiClient from './apiClient';

export const lmsService = {
  // Dashboard
  getDashboardStats: async () => {
    return apiClient.get('/lms/dashboard/stats');
  },

  // Cohorts
  getCohorts: async () => {
    return apiClient.get('/cohorts');
  },

  getActiveCohort: async () => {
    return apiClient.get('/lms/cohorts/active');
  },

  createCohort: async (cohortData: {
    name: string;
    cohortNumber: number;
    tracks: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    maxStudents: number;
    description?: string;
  }) => {
    return apiClient.post('/cohorts/create', cohortData);
  },

  setActiveCohort: async (cohortId: string) => {
    return apiClient.patch(`/lms/cohorts/${cohortId}/activate`);
  },

  // Students
  getStudents: async (params?: {
    cohortId?: string;
    trackId?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/lms/students', { params });
  },

  getStudent: async (studentId: string) => {
    return apiClient.get(`/lms/students/${studentId}`);
  },

  // Announcements
  getAnnouncements: async (trackId?: string) => {
    return apiClient.get('/lms/announcements', {
      params: trackId ? { trackId } : {},
    });
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    trackId?: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    return apiClient.post('/lms/announcements', data);
  },
};
