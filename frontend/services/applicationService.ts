import apiClient from './apiClient';
import {
  IApplication,
  ApplicationForm,
  ApiResponse,
  IApplicationSubmissionResponse,
  IPaginatedApplicationsResponse,
} from '@/types';

export const applicationService = {
  // Submit application with form data (including file upload)
  submitApplication: async (
    formData: FormData
  ): Promise<ApiResponse<IApplicationSubmissionResponse>> => {
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
  }): Promise<ApiResponse<IPaginatedApplicationsResponse>> => {
    const response = await apiClient.get('/applications', { params });
    return response.data;
  },

  // Get applications by cohort (admin/mentor) - Using main endpoint with filter
  getApplicationsByCohort: async (
    cohortId: string
  ): Promise<ApiResponse<IPaginatedApplicationsResponse>> => {
    const response = await apiClient.get('/applications', {
      params: { cohort: cohortId },
    });
    return response.data;
  },

  // Get applications by track (mentor) - Using main endpoint with filter
  getApplicationsByTrack: async (
    trackId: string
  ): Promise<ApiResponse<IPaginatedApplicationsResponse>> => {
    const response = await apiClient.get('/applications', {
      params: { track: trackId },
    });
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
    const response = await apiClient.patch(
      `/applications/${applicationId}/review`,
      reviewData
    );
    return response.data;
  },

  // Accept application (admin only) - uses reviewApplication with accepted status
  acceptApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(
      `/applications/${applicationId}/review`,
      { status: 'accepted' }
    );
    return response.data;
  },

  // Shortlist application (admin/mentor)
  shortlistApplication: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(
      `/applications/${applicationId}/review`,
      { status: 'shortlisted' }
    );
    return response.data;
  },

  // Reject application (admin/mentor)
  rejectApplication: async (
    applicationId: string,
    rejectionReason?: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(
      `/applications/${applicationId}/review`,
      {
        status: 'rejected',
        rejectionReason,
      }
    );
    return response.data;
  },

  // TODO: Implement these endpoints in backend when needed
  // getApplicationStats: async (cohortId?: string): Promise<ApiResponse<any>> => {
  //   const response = await apiClient.get('/applications/stats', {
  //     params: cohortId ? { cohortId } : {},
  //   });
  //   return response.data;
  // },

  // bulkUpdateApplications: async (
  //   applicationIds: string[],
  //   status: string
  // ): Promise<ApiResponse<any>> => {
  //   const response = await apiClient.patch('/applications/bulk-update', {
  //     applicationIds,
  //     status,
  //   });
  //   return response.data;
  // },

  // exportApplications: async (cohortId?: string): Promise<ApiResponse<any>> => {
  //   const response = await apiClient.get('/applications/export', {
  //     params: cohortId ? { cohortId } : {},
  //     responseType: 'blob',
  //   });
  //   return response.data;
  // },

  // Legacy methods for backward compatibility
  getTracks: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/tracks/active');
    return response.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.patch(
      `/applications/${applicationId}/review`,
      { status }
    );
    return response.data;
  },

  getApplicationStatus: async (
    applicationId: string
  ): Promise<ApiResponse<IApplication>> => {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  },
};
