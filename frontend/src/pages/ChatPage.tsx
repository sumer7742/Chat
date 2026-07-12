import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { useLoveStore } from '@/store/loveStore';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { FloatingHearts } from '@/components/love/FloatingHearts';
import { chatDisplay } from '@/lib/chat';

/** One-time picker: choose which chat is "my Princess". */
function PartnerPicker({ onPick }: { onPick: (id: string) => void }) {
  const { user } = useAuth();
  const { data, isLoading } = useChats();
  const [showNew, setShowNew] = useState(false);

  const privateChats = useMemo(
    () => (data?.items ?? []).filter((c) => c.type === 'private'),
    [data],
  );

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden love-bg p-6 text-center">
      <FloatingHearts count={14} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-2 text-6xl animate-heartbeat">👑</div>
        <h1 className="font-script text-4xl love-text">Choose your Princess</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Pick the one this whole world is for 💕
        </p>

        <div className="mt-6 space-y-2.5">
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : privateChats.length === 0 ? (
            <p className="text-sm text-slate-400">No chats yet — start one below.</p>
          ) : (
            privateChats.map((c) => {
              const d = chatDisplay(c, user ?? null);
              return (
                <button
                  key={c._id}
                  onClick={() => onPick(c._id)}
                  className="glass-card flex w-full items-center gap-3 p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="rounded-full love-gradient p-0.5 shadow-glow">
                    <Avatar name={d.name} src={d.avatarUrl} id={d.id} size={44} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-700 dark:text-slate-100">{d.name}</p>
                    <p className="truncate text-xs text-princess-purple">@{d.otherUser?.username}</p>
                  </div>
                  <span className="text-xl">💖</span>
                </button>
              );
            })
          )}
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="heart-btn mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white"
        >
          ＋ Start a new chat
        </button>
      </div>

      <NewChatModal open={showNew} onClose={() => setShowNew(false)} onCreated={onPick} />
    </div>
  );
}

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { setActiveChat } = useUIStore();
  const { settings, setSettings } = useLoveStore();
  const { data } = useChats();

  // The one chat we always open: an explicit route param wins, else the saved partner.
  const activeId = chatId ?? settings.partnerChatId;

  // If the saved partner chat no longer exists, forget it so the picker reappears.
  useEffect(() => {
    if (!settings.partnerChatId || !data) return;
    const exists = data.items.some((c) => c._id === settings.partnerChatId);
    if (!exists) setSettings({ partnerChatId: '' });
  }, [settings.partnerChatId, data, setSettings]);

  useEffect(() => {
    setActiveChat(activeId ?? null);
  }, [activeId, setActiveChat]);

  const pick = (id: string) => {
    setSettings({ partnerChatId: id });
    navigate('/', { replace: true });
  };

  if (!activeId) {
    return <PartnerPicker onPick={pick} />;
  }

  return (
    <div className="h-full love-bg">
      <ChatWindow chatId={activeId} onBack={() => navigate('/love')} />
    </div>
  );
}
