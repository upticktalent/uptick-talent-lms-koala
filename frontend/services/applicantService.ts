import apiClient from './apiClient';
import { IApplicant } from '@/types';

export const applicantService = {
  // Submit application with form data (including file upload)
  submitApplication: async (formData: FormData) => {
    return apiClient.post('/applications/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get available tracks
  getTracks: async () => {
    return apiClient.get('/tracks/active');
  },

  // Get available cohorts (active ones accepting applications)
  getCohorts: async () => {
    return apiClient.get('/cohorts/active');
  },

  // Get current active cohort (single cohort accepting applications)
  getCurrentActiveCohort: async () => {
    return apiClient.get('/cohorts/current-active');
  },

  // Get all applications (admin)
  getApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/applications', { params });
  },

  // Update application status (admin)
  updateApplicationStatus: async (applicantId: string, status: string) => {
    return apiClient.patch(`/applications/${applicantId}/review`, {
      status,
    });
  },

  // Shortlist applicant (admin)
  shortlistApplicant: async (applicantId: string) => {
    return apiClient.patch(
      `/applications/${applicantId}/shortlist`
    );
  },

  // Get single application (admin)
  getApplication: async (applicantId: string) => {
    return apiClient.get(`/applications/${applicantId}`);
  },

  // Get application status by ID
  getApplicationStatus: async (applicationId: string) => {
    return apiClient.get(`/applications/${applicationId}`);
  },
};
