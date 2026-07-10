import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

/**
 * One document per authenticated device session. Holds the *hashed* current
 * refresh token so we can rotate + detect reuse, plus device metadata for the
 * "active sessions / logout everywhere" screens.
 */
export interface ISession {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  refreshTokenHash: string;
  jti: string;
  userAgent: string;
  ip: string;
  deviceName: string;
  lastActiveAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionDocument = HydratedDocument<ISession>;

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },
    jti: { type: String, required: true, index: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    deviceName: { type: String, default: 'Unknown device' },
    lastActiveAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: true },
);

// TTL index — Mongo purges expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> = model<ISession>('Session', sessionSchema);
