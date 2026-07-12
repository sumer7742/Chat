import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Chat, User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MediaGallery } from './MediaGallery';
import { chatDisplay, myMember } from '@/lib/chat';
import { chatService } from '@/services/chat.service';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/lib/queryClient';
import { apiErrorMessage } from '@/lib/api';

export function ChatInfoModal({
  open,
  onClose,
  chat,
  me,
}: {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  me: User | null;
}) {
  const qc = useQueryClient();
  const display = chatDisplay(chat, me);
  const mine = myMember(chat, me);
  const [busy, setBusy] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const isOwnerOrMod = chat.owner === me?._id || chat.admins.includes(me?._id ?? '');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.chats });
    qc.invalidateQueries({ queryKey: queryKeys.chat(chat._id) });
  };

  const run = async (fn: () => Promise<unknown>, msg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (msg) toast.success(msg);
      invalidate();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleMute = () => run(() => chatService.setFlags(chat._id, { muted: !mine?.muted }), mine?.muted ? 'Unmuted' : 'Muted');
  const toggleArchive = () =>
    run(() => chatService.setFlags(chat._id, { archived: !mine?.archived }), mine?.archived ? 'Unarchived' : 'Archived');
  const togglePin = () => run(() => chatService.setFlags(chat._id, { pinned: !mine?.pinned }));

  const blockUser = () =>
    display.otherUser && run(() => userService.block(display.otherUser!._id), 'User blocked');

  const leave = () =>
    run(async () => {
      await chatService.leave(chat._id);
      onClose();
    }, 'Left chat');

  const copyInvite = () => {
    if (chat.inviteCode) {
      navigator.clipboard.writeText(chat.inviteCode);
      toast.success('Invite code copied');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={display.isGroup ? 'Group info' : 'Contact info'}>
      <div className="flex flex-col items-center gap-2 pb-4">
        <Avatar name={display.name} src={display.avatarUrl} id={display.id} size={88} />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{display.name}</h3>
        {display.isGroup ? (
          <p className="text-sm text-slate-500">{chat.members.length} members · {chat.description || 'No description'}</p>
        ) : (
          <p className="text-sm text-slate-500">@{display.otherUser?.username} · {display.otherUser?.bio || 'Hey there!'}</p>
        )}
      </div>

      {display.isGroup && (
        <div className="scrollbar-thin mb-4 max-h-40 overflow-y-auto rounded-lg bg-surface-muted p-2 dark:bg-surface-hover">
          {chat.members.map((m) => (
            <div key={m.user._id} className="flex items-center gap-2 px-1 py-1.5">
              <Avatar name={m.user.displayName} src={m.user.avatarUrl} id={m.user._id} size={32} />
              <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{m.user.displayName}</span>
              <span className="text-xs capitalize text-slate-400">{m.role}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setGalleryOpen(true)}
        className="mb-3 flex w-full items-center justify-between rounded-xl bg-surface-muted px-4 py-3 text-sm text-slate-700 transition hover:bg-surface-hover dark:bg-surface-hover dark:text-slate-200 dark:hover:bg-surface-panel"
      >
        <span className="font-medium">🖼️ Shared media</span>
        <span className="text-slate-400">Photos & videos ›</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={toggleMute} disabled={busy}>
          {mine?.muted ? 'Unmute' : 'Mute'}
        </Button>
        <Button variant="secondary" size="sm" onClick={toggleArchive} disabled={busy}>
          {mine?.archived ? 'Unarchive' : 'Archive'}
        </Button>
        <Button variant="secondary" size="sm" onClick={togglePin} disabled={busy}>
          {mine?.pinned ? 'Unpin' : 'Pin'}
        </Button>
        {display.isGroup && isOwnerOrMod && chat.inviteCode && (
          <Button variant="secondary" size="sm" onClick={copyInvite} disabled={busy}>
            Copy invite
          </Button>
        )}
        {!display.isGroup && (
          <Button variant="danger" size="sm" onClick={blockUser} disabled={busy}>
            Block
          </Button>
        )}
        {display.isGroup && (
          <Button variant="danger" size="sm" onClick={leave} disabled={busy}>
            Leave group
          </Button>
        )}
      </div>

      <MediaGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} chat={chat} me={me} />
    </Modal>
  );
}
