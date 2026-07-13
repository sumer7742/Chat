import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { coupleService } from '@/services/couple.service';
import { useCouple } from '@/hooks/useCouple';
import { useAuthStore } from '@/store/authStore';
import { useLoveStore } from '@/store/loveStore';
import { queryKeys } from '@/lib/queryClient';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { FloatingHearts } from '@/components/love/FloatingHearts';
import { apiErrorMessage } from '@/lib/api';

export default function CoupleInvitePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const userId = useAuthStore((s) => s.user?._id);
  const setSettings = useLoveStore((s) => s.setSettings);
  const [code, setCode] = useState('');

  const { data: couple, isLoading } = useCouple();

  const join = useMutation({
    mutationFn: (inviteCode: string) => coupleService.join(inviteCode),
    onSuccess: (c) => {
      if (userId) qc.setQueryData(queryKeys.couple(userId), c);
      if (c.chatId) setSettings({ partnerChatId: c.chatId });
      sessionStorage.removeItem('pendingInvite');
      toast.success('Two hearts, linked forever 💞');
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  // Arrived via an invite link while already signed in → auto-link once.
  // Ignore the param if it's the user's OWN code (owner opening their own link).
  const prefill = (params.get('invite') ?? '').toUpperCase();
  useEffect(() => {
    if (!couple || couple.linked || join.isPending || join.isSuccess) return;
    if (prefill.length >= 4 && prefill !== couple.inviteCode) {
      setCode(prefill);
      join.mutate(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, couple?.linked, couple?.inviteCode]);

  const inviteLink = couple ? `${window.location.origin}/invite/${couple.inviteCode}` : '';

  const copy = () => {
    if (!couple) return;
    navigator.clipboard.writeText(couple.inviteCode);
    toast.success('Invite code copied 💌');
  };

  const share = async () => {
    if (!couple) return;
    const text = `Join me in our private love app 💕\nCode: ${couple.inviteCode}\n${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Only for My Princess ❤️', text, url: inviteLink });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Invitation copied — send it to your partner 💗');
    }
  };

  const enterWorld = () => {
    if (couple?.chatId) setSettings({ partnerChatId: couple.chatId });
    navigate('/love');
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden love-bg p-6">
      <FloatingHearts count={14} />

      <div className="relative z-10 w-full max-w-sm animate-fade-in text-center">
        {isLoading || !couple ? (
          <div className="flex justify-center py-20"><Spinner size={28} /></div>
        ) : couple.linked ? (
          /* Already linked */
          <div className="glass-card p-8">
            <div className="mb-3 text-5xl animate-heartbeat">💞</div>
            <h1 className="text-2xl font-bold love-text">You&apos;re a couple now</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Linked with your one and only</p>
            {couple.partner && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="rounded-full love-gradient p-0.5 shadow-glow">
                  <Avatar name={couple.partner.displayName} src={couple.partner.avatarUrl} id={couple.partner._id} size={56} />
                </span>
                <div className="text-left">
                  <p className="font-semibold text-slate-700 dark:text-slate-100">{couple.partner.displayName}</p>
                  <p className="text-xs text-princess-purple">@{couple.partner.username}</p>
                </div>
              </div>
            )}
            <button onClick={enterWorld} className="heart-btn mt-6 w-full rounded-2xl py-3.5 font-semibold text-white">
              Enter our world 💖
            </button>
          </div>
        ) : (
          /* Not linked yet — show my code + join box */
          <>
            <div className="glass-card p-8">
              <div className="mb-2 text-5xl">👑</div>
              <h1 className="text-2xl font-bold love-text">Your Couple Code</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Share this with your partner</p>

              <div className="my-5 select-all rounded-2xl border-2 border-dashed border-princess-pink/40 bg-white/50 py-4 text-3xl font-extrabold tracking-[0.2em] love-text dark:bg-white/5">
                {couple.inviteCode}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  toast.success('Invite link copied 🔗');
                }}
                className="mb-3 block w-full select-all truncate rounded-xl bg-princess-purple/10 px-3 py-2 text-xs text-princess-purple"
                title="Tap to copy link"
              >
                🔗 {inviteLink}
              </button>

              <div className="flex gap-2">
                <button onClick={copy} className="glass-card flex-1 rounded-xl py-2.5 text-sm font-medium text-princess-purple">
                  📋 Copy
                </button>
                <button onClick={share} className="heart-btn flex-1 rounded-xl py-2.5 text-sm font-semibold text-white">
                  📤 Share
                </button>
              </div>
            </div>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-princess-purple/20" /> or join your partner <span className="h-px flex-1 bg-princess-purple/20" />
            </div>

            <div className="glass-card p-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-100">Have their code?</h2>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LOVE-XXXX"
                className="mb-3 w-full rounded-xl border border-princess-pink/25 bg-white/70 px-3 py-2.5 text-center text-lg font-bold tracking-widest outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
              />
              <button
                onClick={() => join.mutate(code)}
                disabled={join.isPending || code.trim().length < 4}
                className="heart-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white disabled:opacity-60"
              >
                {join.isPending && <Spinner size={16} className="text-white" />}
                Link our hearts 💕
              </button>
            </div>

            <button onClick={() => navigate('/')} className="mt-4 text-xs text-slate-400 hover:text-princess-purple">
              I&apos;ll do this later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
