import apiClient from './apiClient';
import { ITrack } from '@/types';

export const trackService = {
  // Get all tracks
  getTracks: async () => {
    return apiClient.get('/tracks');
  },

  // Get active tracks only
  getActiveTracks: async () => {
    return apiClient.get('/tracks/active');
  },

  // Get track by slug
  getTrackBySlug: async (slug: string) => {
    return apiClient.get(`/tracks/${slug}`);
  },

  // Get track by trackId (e.g., "frontend-development")
  getTrackByTrackId: async (trackId: string) => {
    return apiClient.get(`/tracks/trackId/${trackId}`);
  },

  // Create track (admin)
  createTrack: async (trackData: Partial<ITrack>) => {
    return apiClient.post('/tracks/create', trackData);
  },

  // Update track (admin)
  updateTrack: async (trackId: string, trackData: Partial<ITrack>) => {
    return apiClient.patch(`/tracks/${trackId}`, trackData);
  },

  // Get track participants
  getTrackParticipants: async (trackId: string) => {
    return apiClient.get(`/tracks/${trackId}/participants`);
  },

  // Get track stream/announcements
  getTrackStream: async (trackId: string) => {
    return apiClient.get(`/tracks/${trackId}/stream`);
  },

  // Get track classroom materials
  getTrackClassroom: async (trackId: string) => {
    return apiClient.get(`/tracks/${trackId}/classroom`);
  },

  // Get track grades
  getTrackGrades: async (trackId: string, studentId?: string) => {
    return apiClient.get(`/tracks/${trackId}/grades`, {
      params: studentId ? { studentId } : {},
    });
  },

  // Assign mentor to track (admin)
  assignMentor: async (trackId: string, mentorId: string) => {
    return apiClient.post(`/tracks/${trackId}/mentors`, { mentorId });
  },

  // Assign student to track (admin)
  assignStudent: async (trackId: string, studentId: string) => {
    return apiClient.post(`/tracks/${trackId}/students`, { studentId });
  },
};
