import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import toast from 'react-hot-toast';
import { EmojiPickerLazy } from './EmojiPickerLazy';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useComposerStore } from '@/store/composerStore';
import { useUIStore } from '@/store/uiStore';
import { getSocket } from '@/lib/socket';
import { uploadService } from '@/services/user.service';
import { chatService } from '@/services/chat.service';
import { apiErrorMessage } from '@/lib/api';
import { SendIcon, PaperclipIcon, SmileIcon, CloseIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/Spinner';
import type { Attachment } from '@/types';

const DRAFT_KEY = (chatId: string) => `draft:${chatId}`;

export function MessageComposer({ chatId }: { chatId: string }) {
  const send = useSendMessage(chatId);
  const { theme } = useUIStore();
  const { replyTo, setReplyTo } = useComposerStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const isTyping = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted draft when switching chats.
  useEffect(() => {
    setText(localStorage.getItem(DRAFT_KEY(chatId)) ?? '');
    setReplyTo(null);
    return () => stopTyping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(DRAFT_KEY(chatId), text), 400);
    return () => clearTimeout(t);
  }, [text, chatId]);

  const emitTyping = () => {
    const socket = getSocket();
    if (!socket.connected) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing', chatId);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 1800);
  };

  const stopTyping = () => {
    if (!isTyping.current) return;
    isTyping.current = false;
    const socket = getSocket();
    if (socket.connected) socket.emit('stop-typing', chatId);
  };

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    stopTyping();
    try {
      await send({ type: 'text', text: value, replyTo: replyTo?._id });
      setText('');
      setReplyTo(null);
      localStorage.removeItem(DRAFT_KEY(chatId));
      chatService.setFlags(chatId, { draft: '' }).catch(() => {});
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const socket = getSocket();
    if (socket.connected) socket.emit('activity', { chatId, kind: 'uploading' });
    try {
      const uploaded = await uploadService.upload(file);
      const attachment: Attachment = {
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        fileName: uploaded.fileName,
        size: uploaded.size,
      };
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
        ? 'audio'
        : 'document';
      await send({ type, attachments: [attachment], text: text.trim() || undefined, replyTo: replyTo?._id });
      setText('');
      setReplyTo(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-3 py-2 dark:border-surface-hover dark:bg-surface-panel">
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border-l-4 border-brand-500 bg-surface-muted px-3 py-1.5 dark:bg-surface-hover">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-300">
              Replying to {replyTo.sender.displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{replyTo.text ?? 'Attachment'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-hover"
        >
          <SmileIcon />
        </button>

        {showEmoji && (
          <div className="absolute bottom-14 left-0 z-30">
            <EmojiPickerLazy
              theme={theme === 'dark' ? 'dark' : 'light'}
              onPick={(emoji) => {
                setText((t) => t + emoji);
                textareaRef.current?.focus();
              }}
            />
          </div>
        )}

        <button
          onClick={() => fileInput.current?.click()}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-hover"
          disabled={uploading}
        >
          {uploading ? <Spinner size={18} /> : <PaperclipIcon />}
        </button>
        <input ref={fileInput} type="file" hidden onChange={onFile} />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
          }}
          onKeyDown={onKeyDown}
          onBlur={stopTyping}
          placeholder="Type a message"
          rows={1}
          className="scrollbar-thin max-h-32 flex-1 resize-none rounded-2xl bg-surface-muted px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-surface-hover dark:text-slate-100"
        />

        <button
          onClick={submit}
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {sending ? <Spinner size={18} className="text-white" /> : <SendIcon />}
        </button>
      </div>
    </div>
  );
}
