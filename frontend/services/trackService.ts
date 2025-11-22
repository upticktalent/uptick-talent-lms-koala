import apiClient from './apiClient';
import { ITrack, ApiResponse } from '@/types';

export const trackService = {
  // Get all tracks
  getTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    const response = await apiClient.get('/tracks');
      return response?.data
  },

  // Get active tracks only
  getActiveTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    const response = await apiClient.get('/tracks/active');
    return response?.data
  },

  // Get track by ID
  getTrackById: async (trackId: string): Promise<ApiResponse<ITrack>> => {
    const response = await apiClient.get(`/tracks/trackId/${trackId}`);
    return response?.data
  },

  // Get track by slug
  getTrackBySlug: async (slug: string): Promise<ApiResponse<ITrack>> => {
    const response = await apiClient.get(`/tracks/slug/${slug}`);
    return response?.data
  },

    // Create new track (admin only)
  createTrack: async (trackData: Partial<ITrack>): Promise<ApiResponse<ITrack>> => {
    const response =await apiClient.post('/tracks/create', trackData);
    return response?.data
  },

  // Update track (admin only)
  updateTrack: async (
    trackId: string,
    trackData: Partial<ITrack>
  ): Promise<ApiResponse<ITrack>> => {
    const response = await apiClient.put(`/tracks/${trackId}`, trackData);
    return response?.data
  },

  // Delete track (admin only)
  deleteTrack: async (trackId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/tracks/${trackId}`);
    return response?.data
  },

  // Get tracks available in current active cohort
  getAvailableTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    const response = await apiClient.get('/tracks/active');
    return response?.data
  },

  // Get track statistics
  getTrackStats: async (trackId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/tracks/${trackId}/stats`);
    return response?.data
  },

  // Get tracks for a specific cohort
  getTracksByCohort: async (
    cohortId: string
  ): Promise<ApiResponse<ITrack[]>> => {
    const response = await apiClient.get(`/tracks/cohort/${cohortId}`);
    return response?.data
  },

  // Get tracks assigned to current mentor
  getMentorTracks: async (): Promise<ApiResponse<ITrack[]>> => {
    const response = await apiClient.get('/tracks/mentor');
    return response?.data
  },

  // Get track with mentor and student details for a cohort
  getTrackDetails: async (
    cohortId: string,
    trackId: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/tracks/${trackId}/cohort/${cohortId}/details`);
    return response?.data
  },

  // Upload track icon/image (admin only)
  uploadTrackIcon: async (
    trackId: string,
    file: File
  ): Promise<ApiResponse<{ iconUrl: string }>> => {
    const formData = new FormData();
    formData.append('icon', file);
    const response = await apiClient.post(`/tracks/${trackId}/upload-icon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data
  },

  // Legacy method alias
  getTrackByTrackId: async (trackId: string): Promise<ApiResponse<ITrack>> => {
    const response = await apiClient.get(`/tracks/${trackId}`);
    return response?.data
  },
};
