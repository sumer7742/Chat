import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { userService } from '@/services/user.service';
import { chatService } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryClient';
import { apiErrorMessage } from '@/lib/api';
import type { User } from '@/types';

type Tab = 'direct' | 'group' | 'join';

export function NewChatModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (chatId: string) => void;
}) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('direct');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: results, isFetching } = useQuery({
    queryKey: queryKeys.userSearch(term),
    queryFn: () => userService.search(term),
    enabled: open && term.trim().length >= 1,
  });

  const reset = () => {
    setTerm('');
    setSelected([]);
    setGroupName('');
    setInviteCode('');
    setTab('direct');
  };

  const close = () => {
    reset();
    onClose();
  };

  const done = (chatId: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.chats });
    onCreated(chatId);
    close();
  };

  const startDirect = async (u: User) => {
    setBusy(true);
    try {
      const chat = await chatService.openPrivate(u._id);
      done(chat._id);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selected.length === 0) {
      toast.error('Name and at least one member required');
      return;
    }
    setBusy(true);
    try {
      const chat = await chatService.createGroup({ name: groupName.trim(), memberIds: selected.map((u) => u._id) });
      done(chat._id);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    setBusy(true);
    try {
      const chat = await chatService.joinByInvite(inviteCode.trim());
      done(chat._id);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (u: User) =>
    setSelected((s) => (s.some((x) => x._id === u._id) ? s.filter((x) => x._id !== u._id) : [...s, u]));

  return (
    <Modal open={open} onClose={close} title="New conversation">
      <div className="mb-4 flex gap-1 rounded-lg bg-surface-muted p-1 text-sm dark:bg-surface-hover">
        {(['direct', 'group', 'join'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 capitalize ${tab === t ? 'bg-white shadow dark:bg-surface-panel' : 'text-slate-500'}`}
          >
            {t === 'join' ? 'Join link' : t}
          </button>
        ))}
      </div>

      {tab === 'join' ? (
        <div className="space-y-3">
          <Input label="Invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="e.g. Xa8f2Kd9Lm" />
          <Button onClick={join} loading={busy} className="w-full">
            Join
          </Button>
        </div>
      ) : (
        <>
          {tab === 'group' && (
            <Input
              label="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Weekend Squad"
              className="mb-3"
            />
          )}
          <Input
            placeholder="Search people by name or @username"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />

          {tab === 'group' && selected.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((u) => (
                <button
                  key={u._id}
                  onClick={() => toggle(u)}
                  className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-1 text-xs text-brand-700 dark:text-brand-300"
                >
                  {u.displayName} ✕
                </button>
              ))}
            </div>
          )}

          <div className="scrollbar-thin mt-3 max-h-64 overflow-y-auto">
            {isFetching ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : (
              (results ?? []).map((u) => {
                const isSel = selected.some((x) => x._id === u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => (tab === 'group' ? toggle(u) : startDirect(u))}
                    disabled={busy}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-muted dark:hover:bg-surface-hover ${isSel ? 'bg-brand-500/10' : ''}`}
                  >
                    <Avatar name={u.displayName} src={u.avatarUrl} id={u._id} size={40} online={u.isOnline} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">{u.displayName}</p>
                      <p className="truncate text-xs text-slate-400">@{u.username}</p>
                    </div>
                    {tab === 'group' && isSel && <span className="ml-auto text-brand-500">✓</span>}
                  </button>
                );
              })
            )}
            {term.trim() && !isFetching && (results ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No users found</p>
            )}
          </div>

          {tab === 'group' && (
            <Button onClick={createGroup} loading={busy} className="mt-3 w-full">
              Create group ({selected.length})
            </Button>
          )}
        </>
      )}
    </Modal>
  );
}
