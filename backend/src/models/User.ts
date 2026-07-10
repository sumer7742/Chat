import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { PrivacyLevel } from './enums';

export interface IUserPrivacy {
  lastSeen: PrivacyLevel;
  profilePhoto: PrivacyLevel;
  readReceipts: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen: Date;
  privacy: IUserPrivacy;
  blockedUsers: Types.ObjectId[];
  mutedUsers: Types.ObjectId[];
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      match: /^[a-zA-Z0-9_.]+$/,
    },
    password: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 64 },
    bio: { type: String, default: '', maxlength: 280 },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: () => new Date() },
    privacy: {
      lastSeen: { type: String, enum: Object.values(PrivacyLevel), default: PrivacyLevel.Everyone },
      profilePhoto: {
        type: String,
        enum: Object.values(PrivacyLevel),
        default: PrivacyLevel.Everyone,
      },
      readReceipts: { type: Boolean, default: true },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    mutedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as { password?: unknown }).password;
        return ret;
      },
    },
  },
);

// Text index powering user search by username / display name.
userSchema.index({ username: 'text', displayName: 'text' });
userSchema.index({ isOnline: 1, lastSeen: -1 });

export const User: Model<IUser> = model<IUser>('User', userSchema);
