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

  getCohortById: async (id: string) => {
    return apiClient.get(`/cohorts/${id}`);
  },

  createCohort: async (cohortData: {
    name: string;
    cohortNumber: number;
    tracks: string[];
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    status: string;
    maxStudents: number;
    description?: string;
  }) => {
    return apiClient.post('/cohorts/create', cohortData);
  },

  setActiveCohort: async (cohortId: string) => {
    return apiClient.patch(`/lms/cohorts/${cohortId}/activate`);
  },
  
  
  deleteCohort : async (cohortId: string) => {
    return apiClient.delete(`/cohorts/${cohortId}`);
  },
  
  
  updateCohort : async (cohortId: string, cohortData: {
    name: string;
    tracks: string[];
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    status: string;
  }) => {
    return apiClient.put(`/cohorts/${cohortId}`, cohortData);
  },

  // Students
  getStudents: async (params?: {
    cohortId?: string;
    trackId?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/users/students', { params });
  },

  getStudent: async (studentId: string) => {
    return apiClient.get(`/users/students/${studentId}`);
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

  // Cohort Mentors
  getCohortMentors: async (cohortId: string) => {
    return apiClient.get(`/cohorts/${cohortId}/mentors`);
  },

  assignMentorToCohort: async (cohortId: string, mentorId: string, trackId?: string) => {
    return apiClient.post(`/cohorts/${cohortId}/mentors`, { mentorId, trackId });
  },

  removeMentorFromCohort: async (cohortId: string, mentorId: string) => {
    return apiClient.delete(`/cohorts/${cohortId}/mentors/${mentorId}`);
  },

  // Cohort Students
  getCohortStudents: async (cohortId: string) => {
    return apiClient.get(`/cohorts/${cohortId}/students`);
  },

  removeStudentFromCohort: async (cohortId: string, studentId: string) => {
    return apiClient.delete(`/cohorts/${cohortId}/students/${studentId}`);
  },
};
