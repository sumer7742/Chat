import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { ChatListItem } from './ChatListItem';
import { NewChatModal } from './NewChatModal';
import { chatDisplay } from '@/lib/chat';
import { MoonIcon, SunIcon, PlusIcon, SearchIcon, SettingsIcon, LogoutIcon } from '@/components/ui/icons';

export function Sidebar({
  activeChatId,
  onOpenChat,
}: {
  activeChatId: string | null;
  onOpenChat: (id: string) => void;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const { data, isLoading } = useChats();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [archived, setArchived] = useState(false);

  const chats = useMemo(() => {
    const items = data?.items ?? [];
    const filtered = items.filter((c) => {
      const inArchive = c.members.find((m) => m.user._id === user?._id)?.archived ?? false;
      if (inArchive !== archived) return false;
      if (!search.trim()) return true;
      return chatDisplay(c, user ?? null).name.toLowerCase().includes(search.toLowerCase());
    });
    return filtered.sort((a, b) => {
      const pa = a.members.find((m) => m.user._id === user?._id)?.pinned ? 1 : 0;
      const pb = b.members.find((m) => m.user._id === user?._id)?.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime();
    });
  }, [data, search, user, archived]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-surface-hover">
        <button onClick={() => navigate('/settings')} className="shrink-0">
          <Avatar name={user?.displayName ?? '?'} src={user?.avatarUrl} id={user?._id} size={40} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{user?.displayName}</p>
          <p className="truncate text-xs text-slate-400">@{user?.username}</p>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-surface-hover"
          title="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-full bg-brand-500 p-2 text-white hover:bg-brand-600"
          title="New chat"
        >
          <PlusIcon />
        </button>
      </header>

      <div className="px-3 py-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg bg-surface-muted py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-surface-panel dark:text-slate-100"
          />
        </div>
        <div className="mt-2 flex gap-1 text-xs">
          <button
            onClick={() => setArchived(false)}
            className={`rounded-full px-3 py-1 ${!archived ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-hover'}`}
          >
            Chats
          </button>
          <button
            onClick={() => setArchived(true)}
            className={`rounded-full px-3 py-1 ${archived ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-hover'}`}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : chats.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            {archived ? 'No archived chats' : 'No conversations yet. Start one!'}
          </p>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              me={user ?? null}
              active={chat._id === activeChatId}
              onClick={() => onOpenChat(chat._id)}
            />
          ))
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-surface-hover">
        <button onClick={() => navigate('/settings')} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200">
          <SettingsIcon className="h-4 w-4" /> Settings
        </button>
        <button onClick={logout} className="flex items-center gap-1 hover:text-red-500">
          <LogoutIcon className="h-4 w-4" /> Logout
        </button>
      </footer>

      <NewChatModal open={showNew} onClose={() => setShowNew(false)} onCreated={onOpenChat} />
    </div>
  );
}
