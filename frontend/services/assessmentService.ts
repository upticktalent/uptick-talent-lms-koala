/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "./apiClient";

export const assessmentService = {
  // Submit assessment
  submitAssessment: async (assessmentData: {
    applicantId: string;
    answers: Record<string, any>;
  }) => {
    return apiClient.post("/assessments/submit", assessmentData);
  },

  // Get all assessments (admin)
  getAssessments: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get("/assessments", { params });
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
