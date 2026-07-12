import { Types } from 'mongoose';
import { Message, type MessageDocument, type IAttachment } from '../models/Message';
import { messageRepository } from '../repositories/message.repository';
import { chatRepository } from '../repositories/chat.repository';
import { Chat } from '../models/Chat';
import { MessageType } from '../models/enums';
import { NotificationType } from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { realtime } from '../socket/emitter';
import { chatService } from './chat.service';
import { notificationService } from './notification.service';

export interface SendMessageInput {
  chatId: string;
  senderId: string;
  type?: (typeof MessageType)[keyof typeof MessageType];
  text?: string;
  attachments?: IAttachment[];
  replyTo?: string;
  forwardedFrom?: string;
  mentions?: string[];
  metadata?: Record<string, unknown>;
}

const SENDER_POPULATE = 'username displayName avatarUrl';

class MessageService {
  private oid(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  private async assertMember(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw ApiError.notFound('Chat not found');
    if (!chat.members.some((m) => m.user.toString() === userId)) {
      throw ApiError.forbidden('You are not a member of this chat');
    }
    return chat;
  }

  async send(input: SendMessageInput): Promise<MessageDocument> {
    const chat = await this.assertMember(input.chatId, input.senderId);

    if (!input.text?.trim() && !(input.attachments?.length) && input.type === MessageType.Text) {
      throw ApiError.badRequest('Message cannot be empty');
    }

    const created = await Message.create({
      chat: this.oid(input.chatId),
      sender: this.oid(input.senderId),
      type: input.type ?? MessageType.Text,
      text: input.text,
      attachments: input.attachments ?? [],
      replyTo: input.replyTo ? this.oid(input.replyTo) : undefined,
      forwardedFrom: input.forwardedFrom ? this.oid(input.forwardedFrom) : undefined,
      mentions: (input.mentions ?? []).map((id) => this.oid(id)),
      metadata: input.metadata,
    });

    await Chat.updateOne(
      { _id: input.chatId },
      { $set: { lastMessage: created._id, lastMessageAt: new Date() } },
    ).exec();
    await chatService.incrementUnread(input.chatId, input.senderId);

    const populated = await this.populate(created._id.toString());
    realtime.messageCreated(input.chatId, populated.toJSON());

    // Notify mentioned users + fan-out message notifications to other members.
    await this.dispatchNotifications(chat.members.map((m) => m.user.toString()), populated, input.mentions ?? []);

    return populated;
  }

  private async dispatchNotifications(memberIds: string[], message: MessageDocument, mentions: string[]) {
    const senderId = message.sender._id?.toString?.() ?? message.sender.toString();
    const mentionSet = new Set(mentions);
    const senderName =
      (message.sender as unknown as { displayName?: string })?.displayName ?? 'Someone';

    await Promise.all(
      memberIds
        .filter((id) => id !== senderId)
        .map((id) =>
          notificationService.create({
            user: id,
            type: mentionSet.has(id) ? NotificationType.Mention : NotificationType.Message,
            title: senderName,
            body: message.text?.slice(0, 120) ?? 'Sent an attachment',
            chat: message.chat.toString(),
            message: message._id.toString(),
            actor: senderId,
          }),
        ),
    );
  }

  async populate(messageId: string): Promise<MessageDocument> {
    const msg = await Message.findById(messageId)
      .populate('sender', SENDER_POPULATE)
      .populate({
        path: 'replyTo',
        select: 'text sender type',
        populate: { path: 'sender', select: 'displayName' },
      })
      .exec();
    if (!msg) throw ApiError.notFound('Message not found');
    return msg;
  }

  async list(chatId: string, userId: string, limit: number, before?: string) {
    await this.assertMember(chatId, userId);
    return messageRepository.listByChat(chatId, userId, { limit, before });
  }

  async listMedia(chatId: string, userId: string) {
    await this.assertMember(chatId, userId);
    return messageRepository.listMedia(chatId, userId);
  }

  async edit(messageId: string, userId: string, text: string): Promise<MessageDocument> {
    const msg = await Message.findById(messageId);
    if (!msg) throw ApiError.notFound('Message not found');
    if (msg.sender.toString() !== userId) throw ApiError.forbidden('You can only edit your own messages');
    if (msg.isDeleted) throw ApiError.badRequest('Cannot edit a deleted message');
    msg.text = text;
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();
    const populated = await this.populate(messageId);
    realtime.messageEdited(msg.chat.toString(), populated.toJSON());
    return populated;
  }

  async deleteForEveryone(messageId: string, userId: string): Promise<void> {
    const msg = await Message.findById(messageId);
    if (!msg) throw ApiError.notFound('Message not found');
    if (msg.sender.toString() !== userId) throw ApiError.forbidden('You can only delete your own messages');
    msg.isDeleted = true;
    msg.text = '';
    msg.attachments = [];
    await msg.save();
    realtime.messageDeleted(msg.chat.toString(), { messageId, forEveryone: true });
  }

  async deleteForMe(messageId: string, userId: string): Promise<void> {
    await Message.updateOne({ _id: messageId }, { $addToSet: { deletedFor: this.oid(userId) } }).exec();
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<MessageDocument> {
    const msg = await Message.findById(messageId);
    if (!msg) throw ApiError.notFound('Message not found');
    await this.assertMember(msg.chat.toString(), userId);

    const existing = msg.reactions.find((r) => r.user.toString() === userId && r.emoji === emoji);
    if (existing) {
      msg.reactions = msg.reactions.filter((r) => !(r.user.toString() === userId && r.emoji === emoji));
    } else {
      msg.reactions = msg.reactions.filter((r) => r.user.toString() !== userId);
      msg.reactions.push({ user: this.oid(userId), emoji, createdAt: new Date() });
    }
    await msg.save();
    realtime.reactionChanged(msg.chat.toString(), {
      messageId,
      reactions: msg.reactions,
    });
    return msg;
  }

  async toggleStar(messageId: string, userId: string): Promise<boolean> {
    const msg = await Message.findById(messageId);
    if (!msg) throw ApiError.notFound('Message not found');
    const starred = msg.starredBy.some((u) => u.toString() === userId);
    await Message.updateOne(
      { _id: messageId },
      starred ? { $pull: { starredBy: this.oid(userId) } } : { $addToSet: { starredBy: this.oid(userId) } },
    ).exec();
    return !starred;
  }

  listStarred(userId: string) {
    return messageRepository.listStarred(userId);
  }

  async forward(messageId: string, userId: string, toChatIds: string[]): Promise<MessageDocument[]> {
    const source = await Message.findById(messageId);
    if (!source) throw ApiError.notFound('Message not found');
    const results: MessageDocument[] = [];
    for (const chatId of toChatIds) {
      const fwd = await this.send({
        chatId,
        senderId: userId,
        type: source.type,
        text: source.text,
        attachments: source.attachments,
        forwardedFrom: source._id.toString(),
        metadata: source.metadata,
      });
      results.push(fwd);
    }
    return results;
  }

  async markSeen(chatId: string, userId: string, upToMessageId: string): Promise<void> {
    await this.assertMember(chatId, userId);
    const modified = await messageRepository.markSeen(chatId, userId, upToMessageId);
    await chatService.markRead(chatId, userId, upToMessageId);
    if (modified > 0) {
      realtime.toChat(chatId, 'message-seen' as never, { chatId, userId, upToMessageId });
    }
  }

  async markDelivered(chatId: string, userId: string): Promise<void> {
    await Message.updateMany(
      {
        chat: this.oid(chatId),
        sender: { $ne: this.oid(userId) },
        deliveredTo: { $ne: this.oid(userId) },
      },
      { $addToSet: { deliveredTo: this.oid(userId) }, $set: { status: 'delivered' } },
    ).exec();
  }

  search(chatId: string, userId: string, term: string) {
    return messageRepository.search(chatId, userId, term);
  }
}

export const messageService = new MessageService();
