import apiClient from './apiClient';
import { IStream, IStreamComment, ApiResponse } from '@/types';

export const streamService = {
  // Get all streams for a cohort and track
  getStreams: async (
    cohortId: string,
    trackId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{ streams: IStream[]; pagination: any }>> => {
    const response = await apiClient.get(`/streams`, {
      params: { cohortId, trackId, page, limit },
    });
    return response.data;
  },

  // Get stream by ID
  getStreamById: async (streamId: string): Promise<ApiResponse<IStream>> => {
    const response = await apiClient.get(`/streams/${streamId}`);
    return response.data;
  },

  // Create new stream (mentor/admin only)
  createStream: async (streamData: {
    cohortId: string;
    trackId: string;
    title: string;
    content: string;
    type: 'announcement' | 'lesson' | 'update';
    scheduledFor?: string;
    attachments?: any[];
  }): Promise<ApiResponse<IStream>> => {
    const response = await apiClient.post('/streams', streamData);
    return response.data;
  },

  // Update stream (creator only)
  updateStream: async (
    streamId: string,
    streamData: Partial<IStream>
  ): Promise<ApiResponse<IStream>> => {
    const response = await apiClient.patch(`/streams/${streamId}`, streamData);
    return response.data;
  },

  // Delete stream (creator only)
  deleteStream: async (streamId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/streams/${streamId}`);
    return response.data;
  },

  // Add reaction to stream
  addReaction: async (
    streamId: string,
    reactionType: 'like' | 'love' | 'helpful' | 'confused'
  ): Promise<ApiResponse<IStream>> => {
    const response = await apiClient.post(`/streams/${streamId}/reactions`, {
      reactionType,
    });
    return response.data;
  },

  // Remove reaction from stream
  removeReaction: async (streamId: string): Promise<ApiResponse<IStream>> => {
    const response = await apiClient.delete(`/streams/${streamId}/reactions`);
    return response.data;
  },

  // Add comment to stream
  addComment: async (
    streamId: string,
    content: string
  ): Promise<ApiResponse<IStreamComment>> => {
    const response = await apiClient.post(`/streams/${streamId}/comments`, {
      content,
    });
    return response.data;
  },

  // Update comment
  updateComment: async (
    streamId: string,
    commentId: string,
    content: string
  ): Promise<ApiResponse<IStreamComment>> => {
    return apiClient.patch(`/streams/${streamId}/comments/${commentId}`, {
      content,
    });
  },

  // Delete comment (comment author or stream creator)
  deleteComment: async (
    streamId: string,
    commentId: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      `/streams/${streamId}/comments/${commentId}`
    );
    return response.data;
  },

  // Add reply to comment
  addCommentReply: async (
    streamId: string,
    commentId: string,
    content: string
  ): Promise<ApiResponse<IStreamComment>> => {
    const response = await apiClient.post(
      `/streams/${streamId}/comments/${commentId}/replies`,
      { content }
    );
    return response.data;
  },

  // Upload attachment for stream
  uploadAttachment: async (
    file: File
  ): Promise<
    ApiResponse<{ url: string; title: string; type: string; size: number }>
  > => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      '/streams/upload-attachment',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get streams for student dashboard (all tracks they're enrolled in)
  getStudentStreams: async (): Promise<ApiResponse<IStream[]>> => {
    const response = await apiClient.get('/streams/student');
    return response.data;
  },

  // Get streams for mentor dashboard (all tracks they're assigned to)
  getMentorStreams: async (): Promise<ApiResponse<IStream[]>> => {
    const response = await apiClient.get('/streams/mentor');
    return response.data;
  },
};
