import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  chats: ['chats'] as const,
  chat: (id: string) => ['chat', id] as const,
  messages: (chatId: string) => ['messages', chatId] as const,
  notifications: ['notifications'] as const,
  sessions: ['sessions'] as const,
  starred: ['starred'] as const,
  userSearch: (q: string) => ['userSearch', q] as const,
};
