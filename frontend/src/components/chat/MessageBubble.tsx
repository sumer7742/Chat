import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Message, User } from '@/types';
import { cn, formatMessageTime, assetUrl, humanFileSize, colorForId } from '@/lib/utils';
import { messageService } from '@/services/message.service';
import { apiErrorMessage } from '@/lib/api';
import { CheckIcon, ChecksIcon, ReplyIcon, StarIcon, TrashIcon, EditIcon, SmileIcon, FileIcon } from '@/components/ui/icons';
import { useComposerStore } from '@/store/composerStore';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function StatusTicks({ message, totalMembers }: { message: Message; totalMembers: number }) {
  const seen = message.seenBy.length >= Math.max(1, totalMembers - 1) && totalMembers <= 2 ? true : message.seenBy.length > 0;
  const delivered = message.deliveredTo.length > 0 || message.status === 'delivered';
  if (message.status === 'seen' || seen) return <ChecksIcon className="h-4 w-4 text-sky-400" />;
  if (message.status === 'delivered' || delivered) return <ChecksIcon className="h-4 w-4 text-slate-400" />;
  return <CheckIcon className="h-3.5 w-3.5 text-slate-400" />;
}

function Attachments({ message }: { message: Message }) {
  return (
    <div className="space-y-1">
      {message.attachments.map((att, i) => {
        const url = assetUrl(att.url);
        if (att.mimeType.startsWith('image/')) {
          return <img key={i} src={url} alt={att.fileName} className="max-h-72 rounded-lg object-cover" loading="lazy" />;
        }
        if (att.mimeType.startsWith('video/')) {
          return <video key={i} src={url} controls className="max-h-72 rounded-lg" />;
        }
        if (att.mimeType.startsWith('audio/')) {
          return <audio key={i} src={url} controls className="w-56" />;
        }
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm hover:bg-black/10 dark:bg-white/10"
          >
            <FileIcon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{att.fileName}</span>
              <span className="text-xs text-slate-400">{humanFileSize(att.size)}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function MessageBubble({
  message,
  me,
  isGroup,
  grouped,
  totalMembers,
}: {
  message: Message;
  me: User | null;
  isGroup: boolean;
  grouped: boolean;
  totalMembers: number;
}) {
  const mine = message.sender._id === me?._id;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text ?? '');
  const setReply = useComposerStore((s) => s.setReplyTo);

  const react = async (emoji: string) => {
    setMenuOpen(false);
    try {
      await messageService.react(message._id, emoji);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await messageService.edit(message._id, editText.trim());
      setEditing(false);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const del = async (everyone: boolean) => {
    try {
      if (everyone) await messageService.deleteForEveryone(message._id);
      else await messageService.deleteForMe(message._id);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const star = async () => {
    try {
      const starred = await messageService.star(message._id);
      toast.success(starred ? 'Starred' : 'Unstarred');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  if (message.type === 'system') {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-slate-500 dark:bg-white/10">{message.text}</span>
      </div>
    );
  }

  const reactionCounts = message.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn('group flex px-1', mine ? 'justify-end' : 'justify-start', grouped ? 'mt-0.5' : 'mt-2')}>
      <div className={cn('relative max-w-[75%]', mine && 'items-end')}>
        <div
          className={cn(
            'relative rounded-2xl px-3 py-2 shadow-sm',
            mine
              ? 'rounded-br-md bg-brand-100 text-slate-900 dark:bg-brand-700 dark:text-white'
              : 'rounded-bl-md bg-white text-slate-900 dark:bg-surface-panel dark:text-slate-100',
          )}
        >
          {isGroup && !mine && !grouped && (
            <p className="mb-0.5 text-xs font-semibold" style={{ color: colorForId(message.sender._id) }}>
              {message.sender.displayName}
            </p>
          )}

          {message.replyTo && (
            <div className="mb-1 border-l-2 border-brand-500 bg-black/5 px-2 py-1 text-xs dark:bg-white/10">
              <p className="font-medium text-brand-600 dark:text-brand-300">
                {message.replyTo.sender?.displayName ?? 'Reply'}
              </p>
              <p className="truncate text-slate-500 dark:text-slate-400">{message.replyTo.text ?? 'Attachment'}</p>
            </div>
          )}

          {message.forwardedFrom && <p className="mb-0.5 text-xs italic text-slate-400">↪ forwarded</p>}

          {message.attachments.length > 0 && <Attachments message={message} />}

          {message.isDeleted ? (
            <p className="italic text-slate-400">🚫 This message was deleted</p>
          ) : editing ? (
            <div className="flex flex-col gap-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-64 resize-none rounded bg-white/70 p-1 text-sm text-slate-900 outline-none dark:bg-black/30 dark:text-white"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs">
                <button onClick={() => setEditing(false)} className="text-slate-500">Cancel</button>
                <button onClick={saveEdit} className="font-semibold text-brand-600">Save</button>
              </div>
            </div>
          ) : (
            message.text && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.type === 'code' ? (
                  <code className="block rounded bg-black/80 p-2 font-mono text-xs text-green-300">{message.text}</code>
                ) : (
                  message.text
                )}
              </p>
            )
          )}

          <div className={cn('mt-0.5 flex items-center justify-end gap-1 text-[10px] text-slate-400')}>
            {message.isEdited && !message.isDeleted && <span>edited</span>}
            <span>{formatMessageTime(message.createdAt)}</span>
            {mine && !message.isDeleted && <StatusTicks message={message} totalMembers={totalMembers} />}
          </div>

          {Object.keys(reactionCounts).length > 0 && (
            <div className="absolute -bottom-3 right-2 flex gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-xs shadow dark:bg-surface-hover">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span key={emoji}>
                  {emoji}
                  {count > 1 && <span className="ml-0.5 text-[10px] text-slate-400">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions */}
        {!message.isDeleted && (
          <div
            className={cn(
              'absolute top-0 z-10 hidden items-center gap-0.5 rounded-full bg-white px-1 py-0.5 shadow group-hover:flex dark:bg-surface-hover',
              mine ? '-left-24' : '-right-24',
            )}
          >
            <button onClick={() => setMenuOpen((v) => !v)} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-surface-panel" title="React">
              <SmileIcon className="h-4 w-4" />
            </button>
            <button onClick={() => setReply(message)} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-surface-panel" title="Reply">
              <ReplyIcon className="h-4 w-4" />
            </button>
            <button onClick={star} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-surface-panel" title="Star">
              <StarIcon className="h-4 w-4" />
            </button>
            {mine && (
              <button onClick={() => { setEditText(message.text ?? ''); setEditing(true); }} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-surface-panel" title="Edit">
                <EditIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => (mine ? del(true) : del(false))}
              className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-surface-panel"
              title={mine ? 'Delete for everyone' : 'Delete for me'}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {menuOpen && (
          <div className={cn('absolute top-8 z-20 flex gap-1 rounded-full bg-white px-2 py-1 shadow-lg dark:bg-surface-hover', mine ? 'right-0' : 'left-0')}>
            {QUICK_REACTIONS.map((e) => (
              <button key={e} onClick={() => react(e)} className="text-lg transition-transform hover:scale-125">
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
