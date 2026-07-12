import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

/**
 * A Couple links exactly two users into one private relationship. Created on
 * signup with a single member + an invite code; the partner joins with that
 * code, after which the couple is permanently linked and capped at 2 members.
 */
export interface ICouple {
  _id: Types.ObjectId;
  inviteCode: string; // e.g. "LOVE-8XK2"
  members: Types.ObjectId[]; // max 2
  createdBy: Types.ObjectId;
  chat?: Types.ObjectId; // the 1:1 chat between the two, created on link
  linkedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CoupleDocument = HydratedDocument<ICouple>;

const coupleSchema = new Schema<ICouple>(
  {
    inviteCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
      validate: {
        validator: (v: Types.ObjectId[]) => v.length <= 2,
        message: 'A couple can have at most 2 members',
      },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    linkedAt: { type: Date },
  },
  { timestamps: true },
);

export const Couple: Model<ICouple> = model<ICouple>('Couple', coupleSchema);
