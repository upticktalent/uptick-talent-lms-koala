import apiClient from './apiClient';
import { IApplication, ApplicationForm, ApiResponse } from '@/types';

export const applicationService = {
  // Submit application with form data (including file upload)
  submitApplication: async (
    formData: FormData
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.post('/applications/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get available tracks for current active cohort
  getAvailableTracks: async (): Promise<ApiResponse<any[]>> => {
    return apiClient.get('/applications/available-tracks');
  },

  // Get current active cohort (accepting applications)
  getCurrentActiveCohort: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/cohorts/current-active');
    return response.data;
  },

  // Get all applications (admin/mentor)
  getApplications: async (params?: {
    status?: string;
    cohort?: string;
    track?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IApplication[]>> => {
    return apiClient.get('/applications', { params });
  },

  // Get applications by cohort (admin/mentor)
  getApplicationsByCohort: async (
    cohortId: string
  ): Promise<ApiResponse<IApplication[]>> => {
    return apiClient.get(`/applications/cohort/${cohortId}`);
  },

  // Get applications by track (mentor)
  getApplicationsByTrack: async (
    trackId: string
  ): Promise<ApiResponse<IApplication[]>> => {
    return apiClient.get(`/applications/track/${trackId}`);
  },

  // Get single application (admin/mentor)
  getApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.get(`/applications/${applicationId}`);
  },

  // Review application (admin/mentor)
  reviewApplication: async (
    applicationId: string,
    reviewData: {
      status: 'under-review' | 'accepted' | 'rejected' | 'shortlisted';
      reviewNotes?: string;
      rejectionReason?: string;
    }
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.patch(`/applications/${applicationId}/review`, reviewData);
  },

  // Accept application and create student (admin only)
  acceptApplication: async (
    applicationId: string
  ): Promise<
    ApiResponse<{
      application: IApplication;
      student: any;
      generatedPassword: string;
    }>
  > => {
    return apiClient.post(`/applications/${applicationId}/accept`);
  },

  // Shortlist application (admin/mentor)
  shortlistApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.patch(`/applications/${applicationId}/shortlist`);
  },

  // Reject application (admin/mentor)
  rejectApplication: async (
    applicationId: string,
    rejectionReason?: string
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.patch(`/applications/${applicationId}/reject`, {
      rejectionReason,
    });
  },

  // Get application statistics
  getApplicationStats: async (cohortId?: string): Promise<ApiResponse<any>> => {
    return apiClient.get('/applications/stats', {
      params: cohortId ? { cohortId } : {},
    });
  },

  // Bulk update applications (admin only)
  bulkUpdateApplications: async (
    applicationIds: string[],
    status: string
  ): Promise<ApiResponse<any>> => {
    return apiClient.patch('/applications/bulk-update', {
      applicationIds,
      status,
    });
  },

  // Export applications to CSV (admin only)
  exportApplications: async (cohortId?: string): Promise<ApiResponse<any>> => {
    return apiClient.get('/applications/export', {
      params: cohortId ? { cohortId } : {},
      responseType: 'blob',
    });
  },

  // Legacy methods for backward compatibility
  getTracks: async (): Promise<ApiResponse<any[]>> => {
    return apiClient.get('/tracks/active');
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: string
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.patch(`/applications/${applicationId}/review`, { status });
  },

  getApplicationStatus: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    return apiClient.get(`/applications/${applicationId}`);
  },
};
