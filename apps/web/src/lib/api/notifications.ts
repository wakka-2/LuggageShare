import { api } from './client';

export interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<ApiNotification[]> {
  const { data } = await api.get<ApiNotification[]>('/notifications');
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
