import apiClient from './apiClient';
import { IInterviewSlot, ApiResponse } from '@/types';

export const interviewSlotService = {
  // Create interview slots (admin/mentor)
  createSlots: async (data: {
    cohortId: string;
    trackId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    meetingLink?: string;
    notes?: string;
  }): Promise<ApiResponse<IInterviewSlot[]>> => {
    return apiClient.post('/interviews/slots', data);
  },

  // Get all interview slots (Admin only)
  getAllSlots: async (params?: {
    cohortId?: string;
    trackId?: string;
    mentorId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IInterviewSlot[]>> => {
    return apiClient.get('/interviews/slots', { params });
  },

  // Get mentor's interview slots
  getMentorSlots: async (params?: {
    cohortId?: string;
    trackId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IInterviewSlot[]>> => {
    return apiClient.get('/interviews/slots/mentor', { params });
  },

  // Get available slots for booking (for current active cohort)
  getAvailableSlots: async (
    trackId?: string
  ): Promise<ApiResponse<IInterviewSlot[]>> => {
    return apiClient.get('/interviews/slots/available', {
      params: trackId ? { trackId } : {},
    });
  },

  // Get slot by ID
  getSlotById: async (slotId: string): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.get(`/interviews/slots/${slotId}`);
  },

  // Legacy method alias
  getSlot: async (slotId: string): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.get(`/interviews/slots/${slotId}`);
  },

  // Update interview slot (mentor/admin)
  updateSlot: async (
    slotId: string,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      meetingLink?: string;
      notes?: string;
      status?: 'available' | 'booked' | 'completed' | 'cancelled';
    }
  ): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.patch(`/interviews/slots/${slotId}`, data);
  },

  // Delete interview slot (mentor/admin)
  deleteSlot: async (slotId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/interviews/slots/${slotId}`);
  },

  // Book an interview slot (for application)
  bookSlot: async (
    slotId: string,
    applicationId: string
  ): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.post(`/interviews/slots/${slotId}/book`, {
      applicationId,
    });
  },

  // Cancel booked slot
  cancelBooking: async (
    slotId: string
  ): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.post(`/interviews/slots/${slotId}/cancel`);
  },

  // Mark slot as completed with feedback
  completeInterview: async (
    slotId: string,
    feedback: {
      notes?: string;
      passed?: boolean;
    }
  ): Promise<ApiResponse<IInterviewSlot>> => {
    return apiClient.post(`/interviews/slots/${slotId}/complete`, feedback);
  },

  // Get slots for a specific cohort and track
  getSlotsByCohortTrack: async (
    cohortId: string,
    trackId: string
  ): Promise<ApiResponse<IInterviewSlot[]>> => {
    return apiClient.get(
      `/interviews/slots/cohort/${cohortId}/track/${trackId}`
    );
  },

  // Get interview statistics
  getInterviewStats: async (
    cohortId?: string,
    trackId?: string
  ): Promise<ApiResponse<any>> => {
    return apiClient.get('/interviews/stats', {
      params: { cohortId, trackId },
    });
  },
};
