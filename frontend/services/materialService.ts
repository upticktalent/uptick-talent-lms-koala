import apiClient from './apiClient';
import { IMaterial, ApiResponse } from '@/types';

export const materialService = {
  // Get all materials for a cohort and track
  getMaterials: async (
    cohortId: string,
    trackId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{ materials: IMaterial[]; pagination: any }>> => {
    const response = await apiClient.get(`/materials`, {
      params: { cohortId, trackId, page, limit },
    });
    return response.data;
  },

  // Get material by ID
  getMaterialById: async (
    materialId: string
  ): Promise<ApiResponse<IMaterial>> => {
    const response = await apiClient.get(`/materials/${materialId}`);
    return response.data;
  },

  // Create new material (mentor/admin only)
  createMaterial: async (materialData: {
    cohortId: string;
    trackId: string;
    title: string;
    description?: string;
    type: 'document' | 'video' | 'link' | 'slides' | 'book' | 'article';
    url: string;
    category: 'lesson' | 'resource' | 'reference' | 'supplementary';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime?: number;
    isRequired: boolean;
    order: number;
    tags?: string[];
  }): Promise<ApiResponse<IMaterial>> => {
    const response = await apiClient.post('/materials', materialData);
    return response.data;
  },

  // Update material (creator only)
  updateMaterial: async (
    materialId: string,
    materialData: Partial<IMaterial>
  ): Promise<ApiResponse<IMaterial>> => {
    const response = await apiClient.patch(
      `/materials/${materialId}`,
      materialData
    );
    return response.data;
  },

  // Delete material (creator only)
  deleteMaterial: async (materialId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/materials/${materialId}`);
    return response.data;
  },

  // Track access to material (analytics)
  trackAccess: async (materialId: string): Promise<ApiResponse<IMaterial>> => {
    const response = await apiClient.post(`/materials/${materialId}/access`);
    return response.data;
  },

  // Get materials for student dashboard (all tracks they're enrolled in)
  getStudentMaterials: async (): Promise<ApiResponse<IMaterial[]>> => {
    const response = await apiClient.get('/materials/student');
    return response.data;
  },

  // Get materials for mentor dashboard (all tracks they're assigned to)
  getMentorMaterials: async (): Promise<ApiResponse<IMaterial[]>> => {
    const response = await apiClient.get('/materials/mentor');
    return response.data;
  },

  // Upload material file (mentor/admin only)
  uploadMaterialFile: async (
    file: File
  ): Promise<
    ApiResponse<{ url: string; title: string; type: string; size: number }>
  > => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get materials by category
  getMaterialsByCategory: async (
    cohortId: string,
    trackId: string,
    category: 'lesson' | 'resource' | 'reference' | 'supplementary'
  ): Promise<ApiResponse<IMaterial[]>> => {
    const response = await apiClient.get(`/materials/category/${category}`, {
      params: { cohortId, trackId },
    });
    return response.data;
  },

  // Get required materials
  getRequiredMaterials: async (
    cohortId: string,
    trackId: string
  ): Promise<ApiResponse<IMaterial[]>> => {
    const response = await apiClient.get(`/materials/required`, {
      params: { cohortId, trackId },
    });
    return response.data;
  },

  // Get material analytics (mentor/admin only)
  getMaterialAnalytics: async (
    materialId: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/materials/${materialId}/analytics`);
    return response.data;
  },
};
