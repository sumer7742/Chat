import { api } from '@/lib/api';
import type { Chat, Paginated } from '@/types';

export const chatService = {
  async list(page = 1, limit = 30, archived?: boolean) {
    const { data } = await api.get<{ data: Paginated<Chat> }>('/chats', {
      params: { page, limit, ...(archived !== undefined ? { archived } : {}) },
    });
    return data.data;
  },
  async get(id: string) {
    const { data } = await api.get<{ data: { chat: Chat } }>(`/chats/${id}`);
    return data.data.chat;
  },
  async openPrivate(userId: string) {
    const { data } = await api.post<{ data: { chat: Chat } }>('/chats/private', { userId });
    return data.data.chat;
  },
  async createGroup(input: { name: string; description?: string; memberIds: string[]; type?: string }) {
    const { data } = await api.post<{ data: { chat: Chat } }>('/chats/group', input);
    return data.data.chat;
  },
  async joinByInvite(code: string) {
    const { data } = await api.post<{ data: { chat: Chat } }>('/chats/join', { code });
    return data.data.chat;
  },
  async updateGroup(id: string, patch: { name?: string; description?: string; avatarUrl?: string }) {
    const { data } = await api.patch<{ data: { chat: Chat } }>(`/chats/${id}`, patch);
    return data.data.chat;
  },
  async addMembers(id: string, memberIds: string[]) {
    const { data } = await api.post<{ data: { chat: Chat } }>(`/chats/${id}/members`, { memberIds });
    return data.data.chat;
  },
  async removeMember(id: string, userId: string) {
    const { data } = await api.delete<{ data: { chat: Chat } }>(`/chats/${id}/members/${userId}`);
    return data.data.chat;
  },
  async setRole(id: string, userId: string, role: string) {
    const { data } = await api.patch<{ data: { chat: Chat } }>(`/chats/${id}/members/${userId}/role`, { role });
    return data.data.chat;
  },
  async setFlags(id: string, flags: { archived?: boolean; pinned?: boolean; muted?: boolean; draft?: string }) {
    await api.patch(`/chats/${id}/flags`, flags);
  },
  async pinMessage(id: string, messageId: string, pin: boolean) {
    const { data } = await api.post<{ data: { chat: Chat } }>(`/chats/${id}/pin`, { messageId, pin });
    return data.data.chat;
  },
  async leave(id: string) {
    await api.post(`/chats/${id}/leave`);
  },
};
