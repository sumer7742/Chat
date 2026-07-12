/** Canonical Socket.IO event names — shared by server handlers and emitter. */
export const SocketEvent = {
  // connection lifecycle
  Connect: 'connect',
  Disconnect: 'disconnect',

  // rooms
  JoinChat: 'join-chat',
  LeaveChat: 'leave-chat',

  // typing / activity
  Typing: 'typing',
  StopTyping: 'stop-typing',
  Activity: 'activity', // recording, uploading, etc.

  // messages
  SendMessage: 'send-message',
  ReceiveMessage: 'receive-message',
  MessageEdited: 'message-edited',
  MessageDeleted: 'message-deleted',
  MessageReaction: 'message-reaction',
  MessageDelivered: 'message-delivered',
  MessageSeen: 'message-seen',

  // presence
  Online: 'online',
  Offline: 'offline',
  PresenceState: 'presence-state',

  // chat / user updates
  ChatUpdated: 'chat-updated',
  UserUpdated: 'user-updated',
  CoupleUpdated: 'couple-updated',
  Notification: 'notification',

  // calls (WebRTC signaling)
  CallStart: 'call-start',
  CallAccept: 'call-accept',
  CallReject: 'call-reject',
  CallEnd: 'call-end',
  CallSignal: 'call-signal', // sdp / ice relay
  ScreenShare: 'screen-share',

  // errors
  Error: 'socket-error',
} as const;
export type SocketEvent = (typeof SocketEvent)[keyof typeof SocketEvent];

export const ActivityKind = {
  Typing: 'typing',
  Recording: 'recording',
  Uploading: 'uploading',
} as const;
export type ActivityKind = (typeof ActivityKind)[keyof typeof ActivityKind];

/** Room helpers keep room-name conventions in one place. */
export const room = {
  chat: (chatId: string) => `chat:${chatId}`,
  user: (userId: string) => `user:${userId}`,
};
