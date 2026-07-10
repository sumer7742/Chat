import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export const CallType = {
  Voice: 'voice',
  Video: 'video',
} as const;
export type CallType = (typeof CallType)[keyof typeof CallType];

export const CallStatus = {
  Ringing: 'ringing',
  Ongoing: 'ongoing',
  Ended: 'ended',
  Missed: 'missed',
  Rejected: 'rejected',
} as const;
export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

export interface ICallParticipant {
  user: Types.ObjectId;
  joinedAt?: Date;
  leftAt?: Date;
}

export interface ICall {
  _id: Types.ObjectId;
  chat?: Types.ObjectId;
  type: CallType;
  status: CallStatus;
  initiator: Types.ObjectId;
  participants: ICallParticipant[];
  startedAt?: Date;
  endedAt?: Date;
  durationSec: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CallDocument = HydratedDocument<ICall>;

const participantSchema = new Schema<ICallParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: Date,
    leftAt: Date,
  },
  { _id: false },
);

const callSchema = new Schema<ICall>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    type: { type: String, enum: Object.values(CallType), required: true },
    status: { type: String, enum: Object.values(CallStatus), default: CallStatus.Ringing },
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    participants: { type: [participantSchema], default: [] },
    startedAt: Date,
    endedAt: Date,
    durationSec: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Call-history queries: a user's calls, newest first.
callSchema.index({ 'participants.user': 1, createdAt: -1 });

export const Call: Model<ICall> = model<ICall>('Call', callSchema);
