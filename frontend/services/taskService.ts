import apiClient from './apiClient';
import { ITask, ITaskSubmission, ApiResponse } from '@/types';

export const taskService = {
  // Get all tasks for a cohort and track
  getTasks: async (
    cohortId: string,
    trackId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{ tasks: ITask[]; pagination: any }>> => {
    const response = await apiClient.get(`/tasks`, {
      params: { cohortId, trackId, page, limit },
    });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<ApiResponse<ITask>> => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Create new task (mentor/admin only)
  createTask: async (taskData: {
    cohortId: string;
    trackId: string;
    title: string;
    description: string;
    type: 'assignment' | 'project' | 'quiz' | 'reading';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    maxScore: number;
    dueDate: string;
    requirements: string[];
    resources?: any[];
    allowLateSubmissions?: boolean;
  }): Promise<ApiResponse<ITask>> => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  // Update task (creator only)
  updateTask: async (
    taskId: string,
    taskData: Partial<ITask>
  ): Promise<ApiResponse<ITask>> => {
    const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task (creator only)
  deleteTask: async (taskId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Get task submissions (mentor/admin can see all, student sees their own)
  getTaskSubmissions: async (
    taskId: string
  ): Promise<ApiResponse<ITaskSubmission[]>> => {
    const response = await apiClient.get(`/tasks/${taskId}/submissions`);
    return response.data;
  },

  // Get specific submission
  getSubmissionById: async (
    taskId: string,
    submissionId: string
  ): Promise<ApiResponse<ITaskSubmission>> => {
    const response = await apiClient.get(
      `/tasks/${taskId}/submissions/${submissionId}`
    );
    return response.data;
  },

  // Submit task (student only)
  submitTask: async (
    taskId: string,
    submissionData: {
      content?: string;
      attachments?: File[];
    }
  ): Promise<ApiResponse<ITaskSubmission>> => {
    const formData = new FormData();

    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }

    if (submissionData.attachments) {
      submissionData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await apiClient.post(`/tasks/${taskId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update submission (student only, before grading)
  updateSubmission: async (
    taskId: string,
    submissionId: string,
    submissionData: {
      content?: string;
      attachments?: File[];
    }
  ): Promise<ApiResponse<ITaskSubmission>> => {
    const formData = new FormData();

    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }

    if (submissionData.attachments) {
      submissionData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await apiClient.patch(
      `/tasks/${taskId}/submissions/${submissionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Grade submission (mentor/admin only)
  gradeSubmission: async (
    taskId: string,
    submissionId: string,
    gradeData: {
      score: number;
      feedback?: string;
    }
  ): Promise<ApiResponse<ITaskSubmission>> => {
    const response = await apiClient.post(
      `/tasks/${taskId}/submissions/${submissionId}/grade`,
      gradeData
    );
    return response.data;
  },

  // Return submission for revision (mentor/admin only)
  returnSubmission: async (
    taskId: string,
    submissionId: string,
    feedback: string
  ): Promise<ApiResponse<ITaskSubmission>> => {
    const response = await apiClient.post(
      `/tasks/${taskId}/submissions/${submissionId}/return`,
      { feedback }
    );
    return response.data;
  },

  // Get tasks for student dashboard (all tasks in their track)
  getStudentTasks: async (): Promise<ApiResponse<ITask[]>> => {
    const response = await apiClient.get('/tasks/student');
    return response.data;
  },

  // Get tasks for mentor dashboard (all tasks in their assigned tracks)
  getMentorTasks: async (): Promise<ApiResponse<ITask[]>> => {
    const response = await apiClient.get('/tasks/mentor');
    return response.data;
  },

  // Get student's submissions across all tasks
  getStudentSubmissions: async (): Promise<ApiResponse<ITaskSubmission[]>> => {
    const response = await apiClient.get('/tasks/student/submissions');
    return response.data;
  },

  // Get submissions to grade for mentor
  getPendingGrading: async (): Promise<ApiResponse<ITaskSubmission[]>> => {
    const response = await apiClient.get('/tasks/mentor/pending-grading');
    return response.data;
  },

  // Upload task resources (mentor/admin only)
  uploadResource: async (
    file: File
  ): Promise<
    ApiResponse<{ url: string; title: string; type: string; size: number }>
  > => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/tasks/upload-resource', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
