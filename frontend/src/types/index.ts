export type ID = string;

export type ChatType = 'private' | 'group' | 'channel' | 'broadcast';
export type MemberRole = 'owner' | 'moderator' | 'member';
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'location'
  | 'contact'
  | 'poll'
  | 'code'
  | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'seen';
export type PrivacyLevel = 'everyone' | 'contacts' | 'nobody';

export interface User {
  _id: ID;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
  privacy: { lastSeen: PrivacyLevel; profilePhoto: PrivacyLevel; readReceipts: boolean };
  blockedUsers: ID[];
  mutedUsers: ID[];
  createdAt: string;
}

export interface ChatMember {
  user: User;
  role: MemberRole;
  joinedAt: string;
  muted: boolean;
  unreadCount: number;
  archived: boolean;
  pinned: boolean;
  draft?: string;
  lastReadMessage?: ID;
}

export interface Attachment {
  url: string;
  mimeType: string;
  fileName: string;
  size: number;
  width?: number;
  height?: number;
  durationMs?: number;
  thumbnailUrl?: string;
}

export interface Reaction {
  user: ID;
  emoji: string;
  createdAt: string;
}

export interface Message {
  _id: ID;
  chat: ID;
  sender: Pick<User, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  type: MessageType;
  text?: string;
  attachments: Attachment[];
  replyTo?: { _id: ID; text?: string; type: MessageType; sender?: { displayName: string } };
  forwardedFrom?: ID;
  mentions: ID[];
  reactions: Reaction[];
  status: MessageStatus;
  deliveredTo: ID[];
  seenBy: ID[];
  starredBy: ID[];
  isDeleted: boolean;
  isEdited: boolean;
  editedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  /** client-only: optimistic send tracking */
  pending?: boolean;
  tempId?: string;
}

export interface Chat {
  _id: ID;
  type: ChatType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  members: ChatMember[];
  admins: ID[];
  owner?: ID;
  inviteCode?: string;
  pinnedMessages: ID[];
  lastMessage?: Message;
  lastMessageAt?: string;
  createdBy: ID;
  createdAt: string;
}

export interface Notification {
  _id: ID;
  user: ID;
  type: 'message' | 'mention' | 'group_invite' | 'reaction' | 'call' | 'system';
  title: string;
  body: string;
  chat?: ID;
  message?: ID;
  actor?: ID;
  read: boolean;
  createdAt: string;
}

export interface DeviceSession {
  id: ID;
  deviceName: string;
  ip: string;
  userAgent: string;
  lastActiveAt: string;
  current: boolean;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
}
export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
