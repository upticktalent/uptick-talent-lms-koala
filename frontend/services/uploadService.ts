import apiClient from './apiClient';

export interface UploadedFile {
  url: string;
  title: string;
  type: 'image' | 'video' | 'document' | 'file';
  size: number;
  publicId?: string;
  mimetype?: string;
  isRequired?: boolean;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedFile | UploadedFile[];
}

export const uploadService = {
  // Upload files for stream attachments
  uploadStreamFiles: async (
    files: FileList | File[],
    cohortId: string,
    trackId: string,
    cohortName?: string,
    trackName?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Add files to FormData
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      formData.append('files', file);
    });

    // Add metadata
    formData.append('cohortId', cohortId);
    formData.append('trackId', trackId);
    if (cohortName) formData.append('cohortName', cohortName);
    if (trackName) formData.append('trackName', trackName);

    try {
      const response = await apiClient.post('/streams/upload-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload files');
    }
  },

  // Upload files for task resources
  uploadTaskFiles: async (
    files: FileList | File[],
    cohortId: string,
    trackId: string,
    cohortName?: string,
    trackName?: string,
    isRequired: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Add files to FormData
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      formData.append('files', file);
    });

    // Add metadata
    formData.append('cohortId', cohortId);
    formData.append('trackId', trackId);
    formData.append('isRequired', isRequired.toString());
    if (cohortName) formData.append('cohortName', cohortName);
    if (trackName) formData.append('trackName', trackName);

    try {
      const response = await apiClient.post('/tasks/upload-resource', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload files');
    }
  },

  // Utility function to validate file type
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      // Documents
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Allowed: Images, Videos, PDF, DOCX, PPTX, TXT'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 50MB limit'
      };
    }

    return { valid: true };
  },

  // Utility function to get file type category
  getFileType: (mimetype: string): 'image' | 'video' | 'document' | 'file' => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('pdf') || 
        mimetype.includes('document') || 
        mimetype.includes('presentation') || 
        mimetype.includes('text/plain')) {
      return 'document';
    }
    return 'file';
  },

  // Utility function to format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default uploadService;