import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryClient';

export function useChats(archived?: boolean) {
  return useQuery({
    queryKey: [...queryKeys.chats, { archived }],
    queryFn: () => chatService.list(1, 50, archived),
  });
}

export function useChat(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.chat(id) : ['chat', 'none'],
    queryFn: () => chatService.get(id!),
    enabled: !!id,
  });
}
