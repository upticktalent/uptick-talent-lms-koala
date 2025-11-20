import apiClient from './apiClient';

export const interviewService = {
  // Create interview (admin/mentor)
  createInterview: async (data: {
    applicationId: string;
    interviewerId: string;
    interviewDate: string;
    interviewTime: string;
    interviewType?: string;
    interviewLink?: string;
    notes?: string;
  }) => {
    return apiClient.post('/interviews', data);
  },

  // Schedule interview (public - for applicants)
  scheduleInterview: async (data: {
    applicationId: string;
    slotId: string;
  }) => {
    return apiClient.post('/interviews/schedule', data);
  },

  // Get all interviews (admin/mentor)
  getInterviews: async (params?: {
    status?: string;
    interviewer?: string;
    applicant?: string;
    track?: string;
    interviewType?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/interviews', { params });
  },

  // Update interview (admin/mentor)
  updateInterview: async (
    interviewId: string,
    data: {
      scheduledDate?: string;
      duration?: number;
      location?: string;
      meetingLink?: string;
      notes?: string;
      interviewType?: string;
      status?: string;
      feedback?: string;
      result?: string;
      rating?: number;
    }
  ) => {
    return apiClient.patch(`/interviews/${interviewId}`, data);
  },

  // Complete interview review (admin/mentor)
  completeInterview: async (
    interviewId: string,
    data: {
      feedback: string;
      status: 'accepted' | 'rejected';
      rating?: number;
      notes?: string;
    }
  ) => {
    return apiClient.patch(`/interviews/${interviewId}/review`, data);
  },

  // Reschedule interview (admin/mentor) - uses updateInterview endpoint
  rescheduleInterview: async (
    interviewId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      reason?: string;
    }
  ) => {
    // Convert separate date and time to scheduledDate
    const scheduledDate = new Date(
      `${data.interviewDate}T${data.interviewTime}`
    );
    return apiClient.patch(`/interviews/${interviewId}`, {
      scheduledDate: scheduledDate.toISOString(),
      notes: data.reason,
    });
  },

  // Cancel interview (admin/mentor)
  cancelInterview: async (
    interviewId: string,
    data: {
      reason?: string;
    }
  ) => {
    return apiClient.patch(`/interviews/${interviewId}/cancel`, data);
  },

  // Get interview by ID
  getInterview: async (interviewId: string) => {
    return apiClient.get(`/interviews/${interviewId}`);
  },

  // Get interview details by ID (alias for getInterview)
  getInterviewDetails: async (interviewId: string) => {
    return apiClient.get(`/interviews/${interviewId}`);
  },

  // Get interview by application ID
  getInterviewByApplication: async (applicationId: string) => {
    return apiClient.get(`/interviews/application/${applicationId}`);
  },

  // Get available slots for scheduling (filtered by application track)
  getAvailableSlots: async (params?: {
    applicationId?: string;
    date?: string;
  }) => {
    return apiClient.get('/interviews/slots/available', { params });
  },

  // Get interviews for applicant
  getApplicantInterviews: async (applicantId: string) => {
    return apiClient.get(`/interviews/applicant/${applicantId}`);
  },

  // Get interview statistics
  getInterviewStats: async (params?: {
    startDate?: string;
    endDate?: string;
    interviewer?: string;
  }) => {
    return apiClient.get('/interviews/stats', { params });
  },
};
