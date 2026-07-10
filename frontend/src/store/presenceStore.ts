import { create } from 'zustand';

interface PresenceState {
  online: Record<string, boolean>;
  lastSeen: Record<string, string>;
  // chatId -> map of userId -> displayName currently typing
  typing: Record<string, Record<string, string>>;
  // chatId -> map of userId -> activity kind (recording/uploading)
  activity: Record<string, Record<string, string>>;
  setOnline: (userId: string, online: boolean, lastSeen?: string) => void;
  bulkOnline: (userIds: string[]) => void;
  setTyping: (chatId: string, userId: string, displayName: string, isTyping: boolean) => void;
  setActivity: (chatId: string, userId: string, kind: string | null) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  online: {},
  lastSeen: {},
  typing: {},
  activity: {},
  setOnline: (userId, online, lastSeen) =>
    set((s) => ({
      online: { ...s.online, [userId]: online },
      lastSeen: lastSeen ? { ...s.lastSeen, [userId]: lastSeen } : s.lastSeen,
    })),
  bulkOnline: (userIds) =>
    set((s) => {
      const next = { ...s.online };
      userIds.forEach((id) => (next[id] = true));
      return { online: next };
    }),
  setTyping: (chatId, userId, displayName, isTyping) =>
    set((s) => {
      const chatTyping = { ...(s.typing[chatId] ?? {}) };
      if (isTyping) chatTyping[userId] = displayName;
      else delete chatTyping[userId];
      return { typing: { ...s.typing, [chatId]: chatTyping } };
    }),
  setActivity: (chatId, userId, kind) =>
    set((s) => {
      const chatActivity = { ...(s.activity[chatId] ?? {}) };
      if (kind) chatActivity[userId] = kind;
      else delete chatActivity[userId];
      return { activity: { ...s.activity, [chatId]: chatActivity } };
    }),
}));
