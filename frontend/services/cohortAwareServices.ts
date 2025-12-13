import { applicationService } from "./applicationService";
import { taskService } from "./taskService";
import { materialService } from "./materialService";
import { streamService } from "./streamService";
import { userService } from "./userService";
import apiClient from "./apiClient";
import { ApiResponse, IPaginatedApplicationsResponse } from "@/types";

/**
 * Cohort-aware service wrappers for LMS context
 * These services automatically include the current cohort ID in API calls
 * Note: Only wrapping methods that actually exist in the services
 */

export const createCohortAwareServices = (cohortId: string | null) => {
  if (!cohortId) {
    throw new Error("No active cohort available");
  }

  return {
    // Applications - All applications within current cohort
    applications: {
      getAll: async (params?: {
        status?: string;
        track?: string;
        page?: number;
        limit?: number;
      }): Promise<ApiResponse<IPaginatedApplicationsResponse>> => {
        // Use cohort-specific endpoint to ensure data is scoped to active cohort
        return applicationService.getApplications({
          ...params,
          cohort: cohortId,
        });
      },

      getByCohort: async (): Promise<
        ApiResponse<IPaginatedApplicationsResponse>
      > => {
        // Direct cohort endpoint - transform to paginated response format
        const response = await applicationService.getApplicationsByCohort(
          cohortId
        );
        if (response.success && Array.isArray(response.data)) {
          // Transform direct array to paginated format for consistency
          return {
            success: true,
            data: {
              applications: response.data,
              pagination: {
                total: response.data.length,
                page: 1,
                limit: response.data.length,
                pages: 1,
              },
            },
            message: response.message,
          };
        }
        return response as any;
      },

      getById: async (applicationId: string) => {
        return applicationService.getApplication(applicationId);
      },

      updateStatus: async (
        applicationId: string,
        status: string,
        feedback?: string
      ) => {
        return applicationService.reviewApplication(applicationId, {
          status: status as any,
          reviewNotes: feedback,
        });
      },
    },

    // Tasks - All tasks within current cohort and specific tracks
    tasks: {
      getAll: async (
        trackId: string,
        params?: {
          page?: number;
          limit?: number;
          status?: string;
        }
      ) => {
        return taskService.getTasks(
          cohortId,
          trackId,
          params?.page,
          params?.limit
        );
      },

      getById: async (taskId: string) => {
        return taskService.getTaskById(taskId);
      },

      create: async (trackId: string, taskData: any) => {
        return taskService.createTask({
          ...taskData,
          cohortId,
          trackId,
        });
      },

      update: async (taskId: string, taskData: any) => {
        return taskService.updateTask(taskId, taskData);
      },

      delete: async (taskId: string) => {
        return taskService.deleteTask(taskId);
      },

      getSubmissions: async (taskId: string) => {
        return taskService.getTaskSubmissions(taskId);
      },

      submitTask: async (taskId: string, submissionData: any) => {
        return taskService.submitTask(taskId, submissionData);
      },
    },

    // Materials - All materials within current cohort and specific tracks
    materials: {
      getAll: async (
        trackId: string,
        params?: {
          page?: number;
          limit?: number;
          type?: string;
        }
      ) => {
        return materialService.getMaterials(
          cohortId,
          trackId,
          params?.page,
          params?.limit
        );
      },

      getById: async (materialId: string) => {
        return materialService.getMaterialById(materialId);
      },

      create: async (trackId: string, materialData: any) => {
        return materialService.createMaterial({
          ...materialData,
          cohortId,
          trackId,
        });
      },

      update: async (materialId: string, materialData: any) => {
        return materialService.updateMaterial(materialId, materialData);
      },

      delete: async (materialId: string) => {
        return materialService.deleteMaterial(materialId);
      },

      upload: async (trackId: string, file: File, metadata?: any) => {
        return materialService.uploadMaterialFile(file);
      },
    },

    // Streams - All streams within current cohort and specific tracks
    streams: {
      getAll: async (
        trackId: string,
        params?: {
          page?: number;
          limit?: number;
        }
      ) => {
        return streamService.getStreams(
          cohortId,
          trackId,
          params?.page,
          params?.limit
        );
      },

      getById: async (streamId: string) => {
        return streamService.getStreamById(streamId);
      },

      create: async (trackId: string, streamData: any) => {
        return streamService.createStream({
          ...streamData,
          cohortId,
          trackId,
        });
      },

      update: async (streamId: string, streamData: any) => {
        return streamService.updateStream(streamId, streamData);
      },

      delete: async (streamId: string) => {
        return streamService.deleteStream(streamId);
      },

      // Note: These methods don't exist in streamService, so we'll throw errors for now
      addComment: async (streamId: string, commentData: any) => {
        throw new Error("Stream comments not yet implemented");
      },

      react: async (streamId: string, reactionType: string) => {
        throw new Error("Stream reactions not yet implemented");
      },
    },

    // Users - Cohort-specific user management
    users: {
      getCohortStudents: async (params?: {
        track?: string;
        page?: number;
        limit?: number;
      }) => {
        const queryParams = params
          ? new URLSearchParams(params as any).toString()
          : "";
        const url = `/cohorts/${cohortId}/students${
          queryParams ? `?${queryParams}` : ""
        }`;
        const response = await apiClient.get(url);
        return response.data;
      },

      getCohortMentors: async (trackId?: string) => {
        return userService.getMentors();
      },

      // Note: These methods don't exist, so we'll provide basic implementations
      getStudentsByTrack: async (trackId: string) => {
        return userService.getStudents({ trackId, cohortId });
      },

      addStudentToCohort: async (userId: string, trackId: string) => {
        throw new Error("Add student to cohort not yet implemented");
      },

      removeStudentFromCohort: async (userId: string) => {
        throw new Error("Remove student from cohort not yet implemented");
      },
    },
  };
};

// Hook to get cohort-aware services
export function useCohortAwareServices(cohortId: string | null) {
  if (!cohortId) {
    return null;
  }

  return createCohortAwareServices(cohortId);
}
