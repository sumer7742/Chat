import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Chat, type IChat, type ChatDocument } from '../models/Chat';
import { ChatType } from '../models/enums';

class ChatRepository extends BaseRepository<IChat> {
  constructor() {
    super(Chat);
  }

  /** Existing 1:1 chat between exactly two users, if any. */
  findPrivateBetween(a: string, b: string): Promise<ChatDocument | null> {
    return Chat.findOne({
      type: ChatType.Private,
      'members.user': { $all: [new Types.ObjectId(a), new Types.ObjectId(b)] },
      members: { $size: 2 },
    }).exec();
  }

  listForUser(
    userId: string,
    opts: { page: number; limit: number; archived?: boolean },
  ): Promise<ChatDocument[]> {
    const match: Record<string, unknown> = { 'members.user': new Types.ObjectId(userId) };
    if (opts.archived !== undefined) {
      match.members = { $elemMatch: { user: new Types.ObjectId(userId), archived: opts.archived } };
    }
    return Chat.find(match)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .populate('members.user', 'username displayName avatarUrl isOnline lastSeen')
      .populate('lastMessage')
      .exec();
  }

  countForUser(userId: string): Promise<number> {
    return Chat.countDocuments({ 'members.user': new Types.ObjectId(userId) }).exec();
  }

  findByInviteCode(code: string): Promise<ChatDocument | null> {
    return Chat.findOne({ inviteCode: code }).exec();
  }

  isMember(chatId: string, userId: string): Promise<boolean> {
    return Chat.exists({ _id: chatId, 'members.user': userId }).then((r) => r !== null);
  }

  memberIds(chat: ChatDocument): string[] {
    return chat.members.map((m) => m.user.toString());
  }
}

export const chatRepository = new ChatRepository();
