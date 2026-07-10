import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Call, type ICall, type CallDocument } from '../models/Call';

class CallRepository extends BaseRepository<ICall> {
  constructor() {
    super(Call);
  }

  history(userId: string, page: number, limit: number): Promise<CallDocument[]> {
    return Call.find({ 'participants.user': new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('initiator', 'username displayName avatarUrl')
      .populate('participants.user', 'username displayName avatarUrl')
      .exec();
  }
}

export const callRepository = new CallRepository();
