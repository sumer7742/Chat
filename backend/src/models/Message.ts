import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { MessageStatus, MessageType } from './enums';

export interface IAttachment {
  url: string;
  mimeType: string;
  fileName: string;
  size: number;
  width?: number;
  height?: number;
  durationMs?: number;
  thumbnailUrl?: string;
}

export interface IReaction {
  user: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  type: MessageType;
  text?: string;
  attachments: IAttachment[];
  replyTo?: Types.ObjectId;
  forwardedFrom?: Types.ObjectId;
  mentions: Types.ObjectId[];
  reactions: IReaction[];
  status: MessageStatus;
  deliveredTo: Types.ObjectId[];
  seenBy: Types.ObjectId[];
  starredBy: Types.ObjectId[];
  // "delete for me" — hidden only for these users.
  deletedFor: Types.ObjectId[];
  isDeleted: boolean; // "delete for everyone"
  isEdited: boolean;
  editedAt?: Date;
  metadata?: Record<string, unknown>; // poll / location / contact / code payloads
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;

const attachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    durationMs: Number,
    thumbnailUrl: String,
  },
  { _id: false },
);

const reactionSchema = new Schema<IReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(MessageType), default: MessageType.Text },
    text: { type: String, maxlength: 8000 },
    attachments: { type: [attachmentSchema], default: [] },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    forwardedFrom: { type: Schema.Types.ObjectId, ref: 'Message' },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions: { type: [reactionSchema], default: [] },
    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.Sent },
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    starredBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Primary access pattern: paginate a chat's timeline newest-first.
messageSchema.index({ chat: 1, createdAt: -1 });
// Full-text message search within chats.
messageSchema.index({ text: 'text' });
messageSchema.index({ starredBy: 1 });

export const Message: Model<IMessage> = model<IMessage>('Message', messageSchema);
