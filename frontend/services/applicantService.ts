import apiClient from "./apiClient";
import { IApplicant } from "@/types";

export const applicantService = {
  // Submit application
  submitApplication: async (applicationData: Partial<IApplicant>) => {
    return apiClient.post("/applications", applicationData);
  },

  // Get all applications (admin)
  getApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get("/applications", { params });
  },

  getApplication: async (applicantId: string) => {
    return apiClient.get(`/applications/${applicantId}`);
  },

  // Update application status (admin)
  updateApplicationStatus: async (applicantId: string, status: string) => {
    return apiClient.patch(`/applications/${applicantId}/review`, {
      status,
    });
  },
};
