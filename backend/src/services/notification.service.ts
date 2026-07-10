import { notificationRepository } from '../repositories/notification.repository';
import { realtime } from '../socket/emitter';
import type { NotificationType } from '../models/Notification';
import { Types } from 'mongoose';

export interface CreateNotificationInput {
  user: string;
  type: NotificationType;
  title: string;
  body?: string;
  chat?: string;
  message?: string;
  actor?: string;
}

class NotificationService {
  async create(input: CreateNotificationInput) {
    const notification = await notificationRepository.create({
      user: new Types.ObjectId(input.user),
      type: input.type,
      title: input.title,
      body: input.body ?? '',
      chat: input.chat ? new Types.ObjectId(input.chat) : undefined,
      message: input.message ? new Types.ObjectId(input.message) : undefined,
      actor: input.actor ? new Types.ObjectId(input.actor) : undefined,
    });
    realtime.notify(input.user, notification.toJSON());
    return notification;
  }

  list(userId: string, page: number, limit: number) {
    return notificationRepository.listForUser(userId, page, limit);
  }

  unreadCount(userId: string) {
    return notificationRepository.unreadCount(userId);
  }

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();
