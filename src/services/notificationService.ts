import { request } from './apiClient.ts';

export interface NotificationItem {
  id: string;
  userId: string;
  disasterId?: string;
  type: 'DISASTER_ALERT' | 'EXPECTED_LOCATION_REQUEST' | 'RECONFIRMATION' | 'SHELTER_UPDATE';
  message: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
  readAt?: string;
  disaster?: any;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
};
