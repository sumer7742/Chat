import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export const NotificationType = {
  Message: 'message',
  Mention: 'mention',
  GroupInvite: 'group_invite',
  Reaction: 'reaction',
  Call: 'call',
  System: 'system',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  chat?: Types.ObjectId;
  message?: Types.ObjectId;
  actor?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    message: { type: Schema.Types.ObjectId, ref: 'Message' },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> = model<INotification>(
  'Notification',
  notificationSchema,
);
