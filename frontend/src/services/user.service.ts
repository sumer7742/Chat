import { api } from '@/lib/api';
import type { DeviceSession, User, Notification as AppNotification } from '@/types';

export const userService = {
  async search(q: string) {
    const { data } = await api.get<{ data: { users: User[] } }>('/users/search', { params: { q } });
    return data.data.users;
  },
  async get(userId: string) {
    const { data } = await api.get<{ data: { user: User } }>(`/users/${userId}`);
    return data.data.user;
  },
  async updateProfile(patch: { displayName?: string; bio?: string; username?: string; avatarUrl?: string }) {
    const { data } = await api.patch<{ data: { user: User } }>('/users/me', patch);
    return data.data.user;
  },
  async updatePrivacy(patch: Record<string, unknown>) {
    const { data } = await api.patch<{ data: { user: User } }>('/users/me/privacy', patch);
    return data.data.user;
  },
  async block(userId: string) {
    await api.post(`/users/${userId}/block`);
  },
  async unblock(userId: string) {
    await api.delete(`/users/${userId}/block`);
  },
  async mute(userId: string) {
    await api.post(`/users/${userId}/mute`);
  },
  async unmute(userId: string) {
    await api.delete(`/users/${userId}/mute`);
  },
  async sessions() {
    const { data } = await api.get<{ data: { sessions: DeviceSession[] } }>('/users/sessions');
    return data.data.sessions;
  },
  async revokeSession(sessionId: string) {
    await api.delete(`/users/sessions/${sessionId}`);
  },
};

export const uploadService = {
  async upload(file: File, onProgress?: (pct: number) => void) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ data: { file: { url: string; key: string; mimeType: string; fileName: string; size: number } } }>(
      '/uploads',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      },
    );
    return data.data.file;
  },
};

export const notificationService = {
  async list(page = 1, limit = 20) {
    const { data } = await api.get<{ data: { notifications: AppNotification[]; unread: number } }>('/notifications', {
      params: { page, limit },
    });
    return data.data;
  },
  async unreadCount() {
    const { data } = await api.get<{ data: { unread: number } }>('/notifications/unread-count');
    return data.data.unread;
  },
  async markAllRead() {
    await api.post('/notifications/read-all');
  },
};
