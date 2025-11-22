import apiClient from './apiClient';
import { ITrack, ApiResponse } from '@/types';

export const trackService = {
  // Get all tracks
  getTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    return apiClient.get('/tracks');
  },

  // Get active tracks only
  getActiveTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    return apiClient.get('/tracks/active');
  },

  // Get track by ID
  getTrackById: async (trackId: string): Promise<ApiResponse<ITrack>> => {
    return apiClient.get(`/tracks/trackId/${trackId}`);
  },

  // Get track by slug
  getTrackBySlug: async (slug: string): Promise<ApiResponse<ITrack>> => {
    return apiClient.get(`/tracks/slug/${slug}`);
  },

  // Create track (admin only)
  createTrack: async (
    trackData: Partial<ITrack>
  ): Promise<ApiResponse<ITrack>> => {
    return apiClient.post('/tracks', trackData);
  },

  // Update track (admin only)
  updateTrack: async (
    trackId: string,
    trackData: Partial<ITrack>
  ): Promise<ApiResponse<ITrack>> => {
    return apiClient.patch(`/tracks/${trackId}`, trackData);
  },

  // Delete track (admin only)
  deleteTrack: async (trackId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/tracks/${trackId}`);
  },

  // Get tracks available in current active cohort
  getAvailableTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    return apiClient.get('/tracks/available');
  },

  // Get track statistics
  getTrackStats: async (trackId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/tracks/${trackId}/stats`);
  },

  // Get tracks for a specific cohort
  getTracksByCohort: async (
    cohortId: string
  ): Promise<ApiResponse<ITrack[]>> => {
    return apiClient.get(`/tracks/cohort/${cohortId}`);
  },

  // Get tracks assigned to current mentor
  getMentorTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    return apiClient.get('/tracks/mentor');
  },

  // Get track with mentor and student details for a cohort
  getTrackDetails: async (
    cohortId: string,
    trackId: string
  ): Promise<ApiResponse<any>> => {
    return apiClient.get(`/tracks/${trackId}/cohort/${cohortId}/details`);
  },

  // Upload track icon/image (admin only)
  uploadTrackIcon: async (
    trackId: string,
    file: File
  ): Promise<ApiResponse<{ iconUrl: string }>> => {
    const formData = new FormData();
    formData.append('icon', file);
    return apiClient.post(`/tracks/${trackId}/upload-icon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Legacy method alias
  getTrackByTrackId: async (trackId: string): Promise<ApiResponse<ITrack>> => {
    return apiClient.get(`/tracks/${trackId}`);
  },
};
