import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { queryKeys } from '@/lib/queryClient';
import { coupleService, type CoupleView } from '@/services/couple.service';
import { partnerLabel } from '@/lib/nicknames';

/**
 * Shared couple query, keyed by the current user so one account never reads
 * another account's cached nickname. Kept fresh (short staleTime + refetch on
 * focus) so a nickname change reflects quickly even if a socket event is missed.
 */
export function useCouple() {
  const userId = useAuthStore((s) => s.user?._id);
  return useQuery<CoupleView>({
    queryKey: queryKeys.couple(userId ?? 'anon'),
    queryFn: coupleService.get,
    enabled: !!userId,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

/** The label the current user uses for their partner (nickname → name → default). */
export function usePartnerNickname(): string {
  const { data } = useCouple();
  return partnerLabel(data?.partnerNickname, data?.partner?.displayName);
}
