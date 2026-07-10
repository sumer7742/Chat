import { Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Chat, type ChatDocument, type IChatMember } from '../models/Chat';
import { chatRepository } from '../repositories/chat.repository';
import { userRepository } from '../repositories/user.repository';
import { ChatType, MemberRole } from '../models/enums';
import { ApiError } from '../utils/ApiError';
import { realtime } from '../socket/emitter';
import { room } from '../socket/events';
import { getIo } from '../socket';

const MEMBER_POPULATE = 'username displayName avatarUrl isOnline lastSeen';

export interface CreateGroupInput {
  name: string;
  description?: string;
  memberIds: string[];
  type?: typeof ChatType.Group | typeof ChatType.Channel | typeof ChatType.Broadcast;
}

class ChatService {
  private oid(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /** Returns (or lazily creates) the 1:1 chat between two users. */
  async getOrCreatePrivate(userId: string, otherId: string): Promise<ChatDocument> {
    if (userId === otherId) throw ApiError.badRequest('Cannot start a chat with yourself');
    const other = await userRepository.findById(otherId);
    if (!other) throw ApiError.notFound('User not found');

    const existing = await chatRepository.findPrivateBetween(userId, otherId);
    if (existing) return this.populated(existing._id.toString());

    const chat = await Chat.create({
      type: ChatType.Private,
      members: [
        { user: this.oid(userId), role: MemberRole.Member },
        { user: this.oid(otherId), role: MemberRole.Member },
      ],
      createdBy: this.oid(userId),
    });
    return this.populated(chat._id.toString());
  }

  async createGroup(userId: string, input: CreateGroupInput): Promise<ChatDocument> {
    const uniqueMembers = Array.from(new Set([userId, ...input.memberIds]));
    const members: IChatMember[] = uniqueMembers.map((id) => ({
      user: this.oid(id),
      role: id === userId ? MemberRole.Owner : MemberRole.Member,
      joinedAt: new Date(),
      muted: false,
      unreadCount: 0,
      archived: false,
      pinned: false,
    }));

    const chat = await Chat.create({
      type: input.type ?? ChatType.Group,
      name: input.name,
      description: input.description,
      members,
      owner: this.oid(userId),
      admins: [this.oid(userId)],
      inviteCode: nanoid(10),
      createdBy: this.oid(userId),
    });
    return this.populated(chat._id.toString());
  }

  async listForUser(userId: string, page: number, limit: number, archived?: boolean) {
    const [items, total] = await Promise.all([
      chatRepository.listForUser(userId, { page, limit, archived }),
      chatRepository.countForUser(userId),
    ]);
    return { items, total };
  }

  async getForMember(chatId: string, userId: string): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    this.assertMember(chat, userId);
    return this.populated(chatId);
  }

  private assertMember(chat: ChatDocument, userId: string): IChatMember {
    const member = chat.members.find((m) => m.user.toString() === userId);
    if (!member) throw ApiError.forbidden('You are not a member of this chat');
    return member;
  }

  private assertAdmin(chat: ChatDocument, userId: string): void {
    const isAdmin =
      chat.owner?.toString() === userId ||
      chat.admins.some((a) => a.toString() === userId);
    if (!isAdmin) throw ApiError.forbidden('Admin privileges required');
  }

  async populated(chatId: string): Promise<ChatDocument> {
    const chat = await Chat.findById(chatId)
      .populate('members.user', MEMBER_POPULATE)
      .populate('lastMessage')
      .exec();
    if (!chat) throw ApiError.notFound('Chat not found');
    return chat;
  }

  async addMembers(chatId: string, actorId: string, memberIds: string[]): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    this.assertAdmin(chat, actorId);

    const current = new Set(chat.members.map((m) => m.user.toString()));
    for (const id of memberIds) {
      if (current.has(id)) continue;
      chat.members.push({
        user: this.oid(id),
        role: MemberRole.Member,
        joinedAt: new Date(),
        muted: false,
        unreadCount: 0,
        archived: false,
        pinned: false,
      } as IChatMember);
    }
    await chat.save();
    return this.broadcastUpdate(chatId);
  }

  async removeMember(chatId: string, actorId: string, targetId: string): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    if (actorId !== targetId) this.assertAdmin(chat, actorId);
    if (chat.owner?.toString() === targetId) {
      throw ApiError.badRequest('Owner cannot be removed — transfer ownership first');
    }
    chat.members = chat.members.filter((m) => m.user.toString() !== targetId);
    chat.admins = chat.admins.filter((a) => a.toString() !== targetId);
    await chat.save();
    getIo()?.to(room.user(targetId)).socketsLeave(room.chat(chatId));
    return this.broadcastUpdate(chatId);
  }

  async setRole(
    chatId: string,
    actorId: string,
    targetId: string,
    role: (typeof MemberRole)[keyof typeof MemberRole],
  ): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    if (chat.owner?.toString() !== actorId) throw ApiError.forbidden('Only the owner can change roles');

    const member = chat.members.find((m) => m.user.toString() === targetId);
    if (!member) throw ApiError.notFound('Member not found');
    member.role = role;

    chat.admins = chat.admins.filter((a) => a.toString() !== targetId);
    if (role === MemberRole.Moderator || role === MemberRole.Owner) {
      chat.admins.push(this.oid(targetId));
    }
    await chat.save();
    return this.broadcastUpdate(chatId);
  }

  async joinByInvite(userId: string, code: string): Promise<ChatDocument> {
    const chat = await chatRepository.findByInviteCode(code);
    if (!chat) throw ApiError.notFound('Invalid invite link');
    if (chat.members.some((m) => m.user.toString() === userId)) {
      return this.populated(chat._id.toString());
    }
    chat.members.push({
      user: this.oid(userId),
      role: MemberRole.Member,
      joinedAt: new Date(),
      muted: false,
      unreadCount: 0,
      archived: false,
      pinned: false,
    } as IChatMember);
    await chat.save();
    return this.broadcastUpdate(chat._id.toString());
  }

  async updateGroup(
    chatId: string,
    actorId: string,
    patch: { name?: string; description?: string; avatarUrl?: string },
  ): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    this.assertAdmin(chat, actorId);
    if (patch.name !== undefined) chat.name = patch.name;
    if (patch.description !== undefined) chat.description = patch.description;
    if (patch.avatarUrl !== undefined) chat.avatarUrl = patch.avatarUrl;
    await chat.save();
    return this.broadcastUpdate(chatId);
  }

  /** Per-member flags: archive, pin, mute, draft. */
  async setMemberFlags(
    chatId: string,
    userId: string,
    flags: { archived?: boolean; pinned?: boolean; muted?: boolean; draft?: string },
  ): Promise<void> {
    const set: Record<string, unknown> = {};
    if (flags.archived !== undefined) set['members.$.archived'] = flags.archived;
    if (flags.pinned !== undefined) set['members.$.pinned'] = flags.pinned;
    if (flags.muted !== undefined) set['members.$.muted'] = flags.muted;
    if (flags.draft !== undefined) set['members.$.draft'] = flags.draft;
    await Chat.updateOne(
      { _id: chatId, 'members.user': this.oid(userId) },
      { $set: set },
    ).exec();
  }

  async pinMessage(chatId: string, actorId: string, messageId: string, pin: boolean): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    this.assertMember(chat, actorId);
    const op = pin ? { $addToSet: { pinnedMessages: this.oid(messageId) } } : { $pull: { pinnedMessages: this.oid(messageId) } };
    await Chat.updateOne({ _id: chatId }, op).exec();
    return this.broadcastUpdate(chatId);
  }

  async markRead(chatId: string, userId: string, lastMessageId: string): Promise<void> {
    await Chat.updateOne(
      { _id: chatId, 'members.user': this.oid(userId) },
      { $set: { 'members.$.unreadCount': 0, 'members.$.lastReadMessage': this.oid(lastMessageId) } },
    ).exec();
  }

  async incrementUnread(chatId: string, exceptUserId: string): Promise<void> {
    await Chat.updateOne(
      { _id: chatId, 'members.user': { $ne: this.oid(exceptUserId) } },
      { $inc: { 'members.$[m].unreadCount': 1 } },
      { arrayFilters: [{ 'm.user': { $ne: this.oid(exceptUserId) } }] },
    ).exec();
  }

  private async broadcastUpdate(chatId: string): Promise<ChatDocument> {
    const chat = await this.populated(chatId);
    realtime.chatUpdated(chatId, chat.toJSON());
    return chat;
  }

  memberIdsOf(chat: ChatDocument): string[] {
    return chat.members.map((m) => m.user.toString());
  }
}

export const chatService = new ChatService();
