import apiClient from './apiClient';

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: 
    | "application_confirmation"
    | "application_acceptance" 
    | "application_rejection"
    | "assessment_invitation"
    | "assessment_confirmation"
    | "assessment_review"
    | "interview_scheduled_notification"
    | "interview_scheduled_confirmation"
    | "welcome_email"
    | "custom";
  variables: string[];
  isActive: boolean;
  createdBy: {
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DirectEmailRequest {
  recipient: {
    email: string;
    name: string;
    id?: string;
    type?: "user" | "applicant" | "external";
  };
  subject: string;
  content: string;
  contentType: "html" | "markdown";
  variables?: Record<string, string | number | boolean>;
}

export interface EmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: EmailTemplate['templateType'];
  variables?: string[];
  isActive?: boolean;
}

export interface BulkEmailRequest {
  recipients: Array<{
    email: string;
    name: string;
    variables?: Record<string, string | number | boolean>;
  }>;
  subject: string;
  content: string;
  contentType: "html" | "markdown";
  globalVariables?: Record<string, string | number | boolean>;
}

export interface SendSingleEmailRequest {
  templateId: string;
  recipientEmail: string;
  recipientName?: string;
  recipientId?: string;
  recipientType?: "user" | "applicant" | "external";
  customVariables?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const emailService = {
  // Direct email operations
  sendDirectEmail: async (emailData: DirectEmailRequest): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/direct-email/send', emailData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  sendBulkEmails: async (bulkData: BulkEmailRequest): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/direct-email/bulk', bulkData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send bulk emails');
    }
  },

  getEmailHistory: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get(`/direct-email/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email history');
    }
  },

  // Email template operations
  getEmailTemplates: async (templateType?: string, isActive?: boolean): Promise<ApiResponse<EmailTemplate[]>> => {
    try {
      const params = new URLSearchParams();
      if (templateType) params.append('templateType', templateType);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      
      const response = await apiClient.get(`/email-templates?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email templates');
    }
  },

  getEmailTemplate: async (id: string): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await apiClient.get(`/email-templates/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email template');
    }
  },

  createEmailTemplate: async (templateData: EmailTemplateRequest): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await apiClient.post('/email-templates', templateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create email template');
    }
  },

  updateEmailTemplate: async (id: string, templateData: Partial<EmailTemplateRequest>): Promise<ApiResponse<EmailTemplate>> => {
    try {
      const response = await apiClient.put(`/email-templates/${id}`, templateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update email template');
    }
  },

  deleteEmailTemplate: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/email-templates/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete email template');
    }
  },

  previewEmailTemplate: async (id: string, variables?: Record<string, any>): Promise<ApiResponse<{ htmlContent: string; textContent?: string }>> => {
    try {
      const response = await apiClient.post(`/email-templates/${id}/preview`, { variables });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to preview email template');
    }
  },

  sendTestEmail: async (id: string, testEmail: string, variables?: Record<string, any>): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post(`/email-templates/${id}/test`, { 
        testEmail,
        variables 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send test email');
    }
  },

  sendSingleEmail: async (emailData: SendSingleEmailRequest): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/email-templates/send-single', emailData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  // Utility functions
  getTemplateVariables: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await apiClient.get('/email-templates/variables');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch template variables');
    }
  },

  getEmailRecipients: async (type?: 'users' | 'applicants'): Promise<ApiResponse<any[]>> => {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await apiClient.get(`/email-templates/recipients${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email recipients');
    }
  },

  getEmailLogs: async (page = 1, limit = 20, filters?: Record<string, any>): Promise<ApiResponse<any>> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/email-templates/logs/history?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email logs');
    }
  }
};

export default emailService;