import apiClient from './apiClient';
import { IApplication, ApplicationForm, ApiResponse } from '@/types';

export const applicationService = {
  // Submit application with form data (including file upload)
  submitApplication: async (
    formData: FormData
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.post('/applications/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get available tracks for current active cohort
  getAvailableTracks: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/tracks/active');
    return response.data;
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
    const response = await apiClient.get('/applications', { params });
    return response.data;
  },

  // Get applications by cohort (admin/mentor)
  getApplicationsByCohort: async (
    cohortId: string
  ): Promise<ApiResponse<IApplication[]>> => {
    const response = await apiClient.get(`/applications/cohort/${cohortId}`);
    return response.data;
  },

  // Get applications by track (mentor)
  getApplicationsByTrack: async (
    trackId: string
  ): Promise<ApiResponse<IApplication[]>> => {
    const response = await apiClient.get(`/applications/track/${trackId}`);
    return response.data;
  },

  // Get single application (admin/mentor)
  getApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
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
    const response = await apiClient.patch(`/applications/${applicationId}/review`, reviewData);
    return response.data;
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
    const response = await apiClient.post(`/applications/${applicationId}/accept`);
    return response.data;
  },

  // Shortlist application (admin/mentor)
  shortlistApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(`/applications/${applicationId}/shortlist`);
    return response.data;
  },

  // Reject application (admin/mentor)
  rejectApplication: async (
    applicationId: string,
    rejectionReason?: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(`/applications/${applicationId}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  // Get application statistics
  getApplicationStats: async (cohortId?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/applications/stats', {
      params: cohortId ? { cohortId } : {},
    });
    return response.data;
  },

  // Bulk update applications (admin only)
  bulkUpdateApplications: async (
    applicationIds: string[],
    status: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch('/applications/bulk-update', {
      applicationIds,
      status,
    });
    return response.data;
  },

  // Export applications to CSV (admin only)
  exportApplications: async (cohortId?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/applications/export', {
      params: cohortId ? { cohortId } : {},
      responseType: 'blob',
    });
    return response.data;
  },

  // Legacy methods for backward compatibility
  getTracks: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/tracks/active');
    return response.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(`/applications/${applicationId}/review`, { status });
    return response.data;
  },

  getApplicationStatus: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  },
};
