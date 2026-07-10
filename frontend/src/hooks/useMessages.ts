import { useInfiniteQuery } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { queryKeys } from '@/lib/queryClient';
import type { Message } from '@/types';

interface Page {
  messages: Message[];
  hasMore: boolean;
}

const PAGE_SIZE = 30;

/**
 * Infinite scroll upward: page 0 = newest. `before` cursor = oldest message id
 * of the last page. Messages within a page are newest-first (as the API
 * returns them); the UI reverses for rendering.
 */
export function useMessages(chatId: string | null) {
  return useInfiniteQuery<Page>({
    queryKey: queryKeys.messages(chatId ?? 'none'),
    enabled: !!chatId,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      messageService.list(chatId!, { limit: PAGE_SIZE, before: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) return undefined;
      return lastPage.messages[lastPage.messages.length - 1]?._id;
    },
  });
}

/** Flattens infinite pages into a single oldest→newest ordered list for rendering. */
export function flattenMessages(pages?: Page[]): Message[] {
  if (!pages) return [];
  const all = pages.flatMap((p) => p.messages);
  const map = new Map<string, Message>();
  for (const m of all) map.set(m._id, m);
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
