import apiClient from './apiClient';

export const interviewSlotService = {
  // Create interview slots (admin/mentor)
  createSlots: async (
    data:
      | {
        mode: 'bulk';
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
        slotDuration: number;
        maxInterviews?: number;
        tracks: string[];
        meetingLink?: string;
        notes?: string;
        cohortId: string;
      }
      | {
        mode: 'manual';
        cohortId: string;
        slots: {
          date: string;
          startTime: string;
          endTime: string;
          duration: number;
          maxInterviews?: number;
          tracks: string[];
          meetingLink?: string;
          notes?: string;
        }[];
      }
  ) => {
    return apiClient.post('/interviews/slots', data);
  },

  // Get all interview slots (Admin only)
  getAllSlots: async (params?: {
    interviewer?: string;
    date?: string;
    track?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/interviews/slots/all', { params });
    return response.data
  },

  // Get current user's interview slots
  getSlots: async (params?: {
    interviewer?: string;
    date?: string;
    available?: boolean;
    interviewType?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/interviews/slots/my-slots', { params });
  },

  // Get available slots for booking
  getAvailableSlots: async (params?: {
    startDate?: string;
    endDate?: string;
    interviewType?: string;
  }) => {
    return apiClient.get('/interviews/slots/available', { params });
  },

  // Update interview slot
  updateSlot: async (
    slotId: string,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      status?: string;
      duration?: number;
      maxInterviews?: number;
      meetingLink?: string;
      notes?: string;
      isAvailable?: boolean;
      tracks?: string[];
    }
  ) => {
    return apiClient.patch(`/interviews/slots/${slotId}`, data);
  },

  // Delete interview slot
  deleteSlot: async (slotId: string) => {
    return apiClient.delete(`/interviews/slots/${slotId}`);
  },

  // Book an interview slot (applicant)
  bookSlot: async (slotId: string, applicantId: string) => {
    return apiClient.post(`/interviews/schedule`, { applicantId, slotId });
  },

  // Get slot details
  getSlot: async (slotId: string) => {
    return apiClient.get(`/interviews/slots/${slotId}`);
  },
};