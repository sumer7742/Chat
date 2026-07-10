import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { ChatType, MemberRole } from './enums';

export interface IChatMember {
  user: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  muted: boolean;
  // Per-member read pointer + unread accounting.
  lastReadMessage?: Types.ObjectId;
  unreadCount: number;
  archived: boolean;
  pinned: boolean;
  draft?: string;
}

export interface IChat {
  _id: Types.ObjectId;
  type: ChatType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  members: IChatMember[];
  admins: Types.ObjectId[];
  owner?: Types.ObjectId;
  inviteCode?: string;
  pinnedMessages: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatDocument = HydratedDocument<IChat>;

const memberSchema = new Schema<IChatMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(MemberRole), default: MemberRole.Member },
    joinedAt: { type: Date, default: () => new Date() },
    muted: { type: Boolean, default: false },
    lastReadMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCount: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    draft: { type: String },
  },
  { _id: false },
);

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: Object.values(ChatType), required: true },
    name: { type: String, trim: true, maxlength: 128 },
    description: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    members: { type: [memberSchema], default: [] },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    inviteCode: { type: String, unique: true, sparse: true },
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Fast "chats for a user, most recent first" lookup.
chatSchema.index({ 'members.user': 1, lastMessageAt: -1 });
chatSchema.index({ type: 1 });

export const Chat: Model<IChat> = model<IChat>('Chat', chatSchema);
