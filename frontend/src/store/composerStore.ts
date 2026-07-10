import { create } from 'zustand';
import type { Message } from '@/types';

interface ComposerState {
  replyTo: Message | null;
  setReplyTo: (m: Message | null) => void;
}

export const useComposerStore = create<ComposerState>((set) => ({
  replyTo: null,
  setReplyTo: (replyTo) => set({ replyTo }),
}));
