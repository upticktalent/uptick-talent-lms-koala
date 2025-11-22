import apiClient from './apiClient';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const notificationService = {
  getNotifications: async () => {
    return apiClient.get('/notifications');
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },
  
  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread-count');
  }
};
