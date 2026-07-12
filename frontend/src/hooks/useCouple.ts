import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { coupleService, type CoupleView } from '@/services/couple.service';
import { partnerLabel } from '@/lib/nicknames';

/** Shared ['couple'] query — safe to call from many components (dedupes). */
export function useCouple() {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const query = useQuery<CoupleView>({
    queryKey: ['couple'],
    queryFn: coupleService.get,
    enabled: authed,
    staleTime: 60_000,
  });
  return query;
}

/** The label the current user uses for their partner (nickname → name → default). */
export function usePartnerNickname(): string {
  const { data } = useCouple();
  return partnerLabel(data?.partnerNickname, data?.partner?.displayName);
}
