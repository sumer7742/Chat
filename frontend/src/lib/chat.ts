import type { Chat, User } from '@/types';

export interface ChatDisplay {
  name: string;
  avatarUrl?: string;
  id: string;
  isGroup: boolean;
  otherUser?: Chat['members'][number]['user'];
}

/** Resolves the name/avatar to show for a chat from the current user's POV. */
export function chatDisplay(chat: Chat, me: User | null): ChatDisplay {
  const isGroup = chat.type !== 'private';
  if (isGroup) {
    return { name: chat.name ?? 'Group', avatarUrl: chat.avatarUrl, id: chat._id, isGroup: true };
  }
  const other = chat.members.find((m) => m.user._id !== me?._id)?.user ?? chat.members[0]?.user;
  return {
    name: other?.displayName ?? 'Unknown',
    avatarUrl: other?.avatarUrl,
    id: other?._id ?? chat._id,
    isGroup: false,
    otherUser: other,
  };
}

export function myMember(chat: Chat, me: User | null) {
  return chat.members.find((m) => m.user._id === me?._id);
}

export function unreadFor(chat: Chat, me: User | null): number {
  return myMember(chat, me)?.unreadCount ?? 0;
}
