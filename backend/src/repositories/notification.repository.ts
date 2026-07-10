import { BaseRepository } from './base.repository';
import { Notification, type INotification, type NotificationDocument } from '../models/Notification';

class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  listForUser(userId: string, page: number, limit: number): Promise<NotificationDocument[]> {
    return Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  unreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ user: userId, read: false }).exec();
  }

  markAllRead(userId: string): Promise<void> {
    return Notification.updateMany({ user: userId, read: false }, { read: true })
      .exec()
      .then(() => undefined);
  }
}

export const notificationRepository = new NotificationRepository();
