import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { coupleService, type CoupleView } from '@/services/couple.service';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/store/authStore';
import { queryKeys } from '@/lib/queryClient';
import { NicknamePicker } from './NicknamePicker';
import { FloatingHearts } from './FloatingHearts';
import { apiErrorMessage } from '@/lib/api';

/**
 * One-time "Personalize Your Love" flow. Appears once both partners are linked
 * and the current user hasn't yet chosen what to call their partner. Each
 * partner picks independently and privately.
 */
export function PersonalizeNickname() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?._id);
  const { data: couple } = useCouple();

  const save = useMutation({
    mutationFn: (nickname: string) => coupleService.setNickname(nickname),
    onSuccess: (c) => {
      if (userId) qc.setQueryData<CoupleView>(queryKeys.couple(userId), c);
      toast.success(`You'll call them ${c.partnerNickname} 💕`);
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  // Only once linked, and only until this user has chosen a nickname.
  if (!couple || !couple.linked || couple.partnerNickname) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center overflow-hidden love-bg p-5">
      <FloatingHearts count={16} />
      <div className="glass-card relative z-10 w-full max-w-md animate-pop-in p-7">
        <div className="mb-1 text-center text-5xl animate-heartbeat">❤️</div>
        <h1 className="text-center text-2xl font-bold love-text">Personalize Your Love</h1>
        <p className="mb-5 mt-1 text-center text-sm text-slate-500 dark:text-slate-300">
          What do you call {couple.partner?.displayName ?? 'your partner'}? This is just for you 💗
        </p>

        <NicknamePicker saving={save.isPending} onSave={(n) => save.mutate(n)} ctaLabel="That's my name for them 💖" />
      </div>
    </div>
  );
}
