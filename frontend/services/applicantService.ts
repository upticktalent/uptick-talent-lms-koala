import apiClient from './apiClient';
import { IApplicant } from '@/types';

export const applicantService = {
  // Submit application
  submitApplication: async (applicationData: Partial<IApplicant>) => {
    return apiClient.post('/recruitment/applications', applicationData);
  },

  // Get applicant status
  getApplicationStatus: async (applicantId: string) => {
    return apiClient.get(`/recruitment/applications/${applicantId}/status`);
  },

  // Get all applications (admin)
  getApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/recruitment/applications', { params });
  },

  // Update application status (admin)
  updateApplicationStatus: async (applicantId: string, status: string) => {
    return apiClient.patch(`/recruitment/applications/${applicantId}/status`, {
      status,
    });
  },

  // Shortlist applicant (admin)
  shortlistApplicant: async (applicantId: string) => {
    return apiClient.patch(`/recruitment/applications/${applicantId}/shortlist`);
  },

  // Get single application (admin)
  getApplication: async (applicantId: string) => {
    return apiClient.get(`/recruitment/applications/${applicantId}`);
  },
};
