export const ChatType = {
  Private: 'private',
  Group: 'group',
  Channel: 'channel',
  Broadcast: 'broadcast',
} as const;
export type ChatType = (typeof ChatType)[keyof typeof ChatType];

export const MemberRole = {
  Owner: 'owner',
  Moderator: 'moderator',
  Member: 'member',
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const MessageType = {
  Text: 'text',
  Image: 'image',
  Video: 'video',
  Audio: 'audio',
  Voice: 'voice',
  Document: 'document',
  Location: 'location',
  Contact: 'contact',
  Poll: 'poll',
  Code: 'code',
  System: 'system',
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageStatus = {
  Sent: 'sent',
  Delivered: 'delivered',
  Seen: 'seen',
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const PrivacyLevel = {
  Everyone: 'everyone',
  Contacts: 'contacts',
  Nobody: 'nobody',
} as const;
export type PrivacyLevel = (typeof PrivacyLevel)[keyof typeof PrivacyLevel];
