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
    if (!value) return;
    const replyId = replyTo?._id;
    // Clear the input instantly — the message renders via the optimistic cache,
    // so the composer never waits on the network round-trip.
    setText('');
    setReplyTo(null);
    localStorage.removeItem(DRAFT_KEY(chatId));
    chatService.setFlags(chatId, { draft: '' }).catch(() => {});
    stopTyping();
    try {
      await send({ type: 'text', text: value, replyTo: replyId });
    } catch (e) {
      toast.error(apiErrorMessage(e));
      setText(value); // restore so the user can retry
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
    <div className="border-t border-princess-pink/15 bg-white/55 px-3 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-4 border-princess-pink bg-princess-pink/10 px-3 py-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-princess-pink">
              Replying to {replyTo.sender.displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{replyTo.text ?? 'Attachment'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-princess-pink">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="rounded-full p-2 text-princess-purple hover:bg-princess-pink/10 dark:text-princess-rose"
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
          className="rounded-full p-2 text-princess-purple hover:bg-princess-pink/10 dark:text-princess-rose"
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
          placeholder="Type something sweet…"
          rows={1}
          className="scrollbar-thin max-h-32 flex-1 resize-none rounded-2xl border border-princess-pink/20 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-princess-pink/40 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
        />

        <button
          onClick={submit}
          disabled={!text.trim()}
          className="heart-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
