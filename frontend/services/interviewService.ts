import apiClient from './apiClient';

export const interviewService = {
  // Schedule interview (admin)
  scheduleInterview: async (data: {
    applicantId: string;
    interviewDate: string;
    interviewTime: string;
    interviewLink?: string;
    notes?: string;
  }) => {
    return apiClient.post('/recruitment/interviews', data);
  },

  // Get all interviews (admin)
  getInterviews: async (params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/recruitment/interviews', { params });
  },

  // Update interview (admin)
  updateInterview: async (interviewId: string, data: {
    interviewDate?: string;
    interviewTime?: string;
    status?: string;
    feedback?: string;
    result?: string;
  }) => {
    return apiClient.patch(`/recruitment/interviews/${interviewId}`, data);
  },

  // Get interview by ID
  getInterview: async (interviewId: string) => {
    return apiClient.get(`/recruitment/interviews/${interviewId}`);
  },

  // Get interviews for applicant
  getApplicantInterviews: async (applicantId: string) => {
    return apiClient.get(`/recruitment/interviews/applicant/${applicantId}`);
  },
};
