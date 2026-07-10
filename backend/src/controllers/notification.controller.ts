import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok, noContent } from '../utils/http';
import { notificationService } from '../services/notification.service';

const uid = (req: Request) => req.user!._id.toString();

export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const [items, unread] = await Promise.all([
    notificationService.list(uid(req), page, limit),
    notificationService.unreadCount(uid(req)),
  ]);
  return ok(res, { notifications: items.map((n) => n.toJSON()), unread, page, limit });
});

export const unreadCount = catchAsync(async (req: Request, res: Response) => {
  const unread = await notificationService.unreadCount(uid(req));
  return ok(res, { unread });
});

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllRead(uid(req));
  return noContent(res);
});
