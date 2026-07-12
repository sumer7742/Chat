import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Message, type IMessage, type MessageDocument } from '../models/Message';

class MessageRepository extends BaseRepository<IMessage> {
  constructor() {
    super(Message);
  }

  /**
   * Cursor pagination over a chat timeline (newest-first). `before` is a message
   * id — returns messages older than it, powering infinite scroll upward.
   */
  async listByChat(
    chatId: string,
    userId: string,
    opts: { limit: number; before?: string },
  ): Promise<MessageDocument[]> {
    const filter: Record<string, unknown> = {
      chat: new Types.ObjectId(chatId),
      deletedFor: { $ne: new Types.ObjectId(userId) },
    };
    if (opts.before) filter._id = { $lt: new Types.ObjectId(opts.before) };

    return Message.find(filter)
      .sort({ _id: -1 })
      .limit(opts.limit)
      .populate('sender', 'username displayName avatarUrl')
      .populate({ path: 'replyTo', select: 'text sender type', populate: { path: 'sender', select: 'displayName' } })
      .exec();
  }

  search(chatId: string, userId: string, term: string, limit = 30): Promise<MessageDocument[]> {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return Message.find({
      chat: new Types.ObjectId(chatId),
      text: regex,
      isDeleted: false,
      deletedFor: { $ne: new Types.ObjectId(userId) },
    })
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  /** Shared image/video attachments in a chat (newest-first), for the media gallery. */
  listMedia(chatId: string, userId: string, limit = 120): Promise<MessageDocument[]> {
    return Message.find({
      chat: new Types.ObjectId(chatId),
      isDeleted: false,
      deletedFor: { $ne: new Types.ObjectId(userId) },
      'attachments.mimeType': { $regex: '^(image|video)/' },
    })
      .sort({ _id: -1 })
      .limit(limit)
      .populate('sender', 'username displayName avatarUrl')
      .exec();
  }

  listStarred(userId: string, limit = 50): Promise<MessageDocument[]> {
    return Message.find({ starredBy: new Types.ObjectId(userId) })
      .sort({ _id: -1 })
      .limit(limit)
      .populate('sender', 'username displayName avatarUrl')
      .exec();
  }

  markSeen(chatId: string, userId: string, upToMessageId: string): Promise<number> {
    return Message.updateMany(
      {
        chat: new Types.ObjectId(chatId),
        _id: { $lte: new Types.ObjectId(upToMessageId) },
        sender: { $ne: new Types.ObjectId(userId) },
        seenBy: { $ne: new Types.ObjectId(userId) },
      },
      { $addToSet: { seenBy: new Types.ObjectId(userId) }, $set: { status: 'seen' } },
    )
      .exec()
      .then((r) => r.modifiedCount);
  }
}

export const messageRepository = new MessageRepository();
