/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiClient';

export const assessmentService = {
  // Check application eligibility for assessment
  checkApplicationEligibility: async (applicationId: string) => {
    return apiClient.get(`/assessments/check-application/${applicationId}`);
  },

  // Submit assessment (file or URL)
  submitAssessment: async (formData: FormData) => {
    return apiClient.post('/assessments/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get assessment by application ID
  getAssessmentByApplication: async (applicationId: string) => {
    return apiClient.get(`/assessments/application/${applicationId}`);
  },

  // Get all assessments (admin)
  getAssessments: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/assessments', { params });
  },

  // Grade assessment (admin)
  gradeAssessment: async (
    assessmentId: string,
    grade: number,
    feedback?: string
  ) => {
    return apiClient.patch(`/assessments/${assessmentId}/grade`, {
      grade,
      feedback,
    });
  },

  // Get assessment by ID (admin)
  getAssessmentById: async (assessmentId: string) => {
    return apiClient.get(`/assessments/${assessmentId}`);
  },

  // Update assessment status (admin)
  updateAssessmentStatus: async (assessmentId: string, status: string) => {
    return apiClient.put(`/assessments/${assessmentId}/review`, {
      status,
    });
  },
};
