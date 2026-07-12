import { api } from '@/lib/api';
import type { Attachment, Message } from '@/types';

export interface SendMessageBody {
  type?: string;
  text?: string;
  attachments?: Attachment[];
  replyTo?: string;
  mentions?: string[];
  metadata?: Record<string, unknown>;
}

export const messageService = {
  async list(chatId: string, opts: { limit?: number; before?: string } = {}) {
    const { data } = await api.get<{ data: { messages: Message[]; hasMore: boolean } }>(
      `/chats/${chatId}/messages`,
      { params: opts },
    );
    return data.data;
  },
  async send(chatId: string, body: SendMessageBody) {
    const { data } = await api.post<{ data: { message: Message } }>(`/chats/${chatId}/messages`, body);
    return data.data.message;
  },
  async edit(messageId: string, text: string) {
    const { data } = await api.patch<{ data: { message: Message } }>(`/messages/${messageId}`, { text });
    return data.data.message;
  },
  async deleteForEveryone(messageId: string) {
    await api.delete(`/messages/${messageId}`);
  },
  async deleteForMe(messageId: string) {
    await api.delete(`/messages/${messageId}/me`);
  },
  async react(messageId: string, emoji: string) {
    const { data } = await api.post<{ data: { reactions: Message['reactions'] } }>(
      `/messages/${messageId}/react`,
      { emoji },
    );
    return data.data.reactions;
  },
  async star(messageId: string) {
    const { data } = await api.post<{ data: { starred: boolean } }>(`/messages/${messageId}/star`);
    return data.data.starred;
  },
  async listStarred() {
    const { data } = await api.get<{ data: { messages: Message[] } }>('/messages/starred');
    return data.data.messages;
  },
  async listMedia(chatId: string) {
    const { data } = await api.get<{ data: { messages: Message[] } }>(`/chats/${chatId}/messages/media`);
    return data.data.messages;
  },
  async forward(messageId: string, chatIds: string[]) {
    const { data } = await api.post<{ data: { messages: Message[] } }>(`/messages/${messageId}/forward`, { chatIds });
    return data.data.messages;
  },
  async search(chatId: string, q: string) {
    const { data } = await api.get<{ data: { messages: Message[] } }>(`/chats/${chatId}/messages/search`, {
      params: { q },
    });
    return data.data.messages;
  },
  async markSeen(chatId: string, upToMessageId: string) {
    await api.post(`/chats/${chatId}/messages/seen`, { upToMessageId });
  },
};
