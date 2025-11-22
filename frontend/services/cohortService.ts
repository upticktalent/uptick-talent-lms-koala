import apiClient from './apiClient';
import { ICohort, ApiResponse } from '@/types';

export const cohortService = {
  // Get all cohorts
  getCohorts: async (): Promise<ApiResponse<ICohort[]>> => {
    const response = await apiClient.get('/cohorts');
    return response.data;
  },

  // Get current active cohort
  getCurrentActiveCohort: async (): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.get('/cohorts/current-active');
    return response.data;
  },

  // Get cohort by ID
  getCohortById: async (cohortId: string): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.get(`/cohorts/${cohortId}`);
    return response.data;
  },

  // Create new cohort (admin only)
  createCohort: async (
    cohortData: Partial<ICohort>
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.post('/cohorts', cohortData);
    return response.data;
  },

  // Update cohort (admin only)
  updateCohort: async (
    cohortId: string,
    cohortData: Partial<ICohort>
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.patch(`/cohorts/${cohortId}`, cohortData);
    return response.data;
  },

  // Set cohort as currently active (admin only)
  setCurrentlyActive: async (
    cohortId: string
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.patch(`/cohorts/${cohortId}/set-active`);
    return response.data;
  },

  // Add track to cohort (admin only)
  addTrackToCohort: async (
    cohortId: string,
    trackData: { trackId: string; mentorIds?: string[]; maxStudents?: number }
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.post(
      `/cohorts/${cohortId}/tracks`,
      trackData
    );
    return response.data;
  },

  // Remove track from cohort (admin only)
  removeTrackFromCohort: async (
    cohortId: string,
    trackId: string
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.delete(
      `/cohorts/${cohortId}/tracks/${trackId}`
    );
    return response.data;
  },

  // Add mentor to cohort track (admin only)
  addMentorToTrack: async (
    cohortId: string,
    trackId: string,
    mentorId: string
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.post(
      `/cohorts/${cohortId}/tracks/${trackId}/mentors`,
      {
        mentorId,
      }
    );
    return response.data;
  },

  // Remove mentor from cohort track (admin only)
  removeMentorFromTrack: async (
    cohortId: string,
    trackId: string,
    mentorId: string
  ): Promise<ApiResponse<ICohort>> => {
    const response = await apiClient.delete(
      `/cohorts/${cohortId}/tracks/${trackId}/mentors/${mentorId}`
    );
    return response.data;
  },

  // Get cohort applications
  getCohortApplications: async (
    cohortId: string
  ): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/cohorts/${cohortId}/applications`);
    return response.data;
  },

  // Get cohort students
  getCohortStudents: async (cohortId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/cohorts/${cohortId}/students`);
    return response.data;
  },

  // Get cohort tracks with details
  getCohortTracks: async (cohortId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/cohorts/${cohortId}/tracks`);
    return response.data;
  },

  // Get cohort statistics
  getCohortStats: async (cohortId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/cohorts/${cohortId}/stats`);
    return response.data;
  },
};
