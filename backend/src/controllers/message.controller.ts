import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok, created, noContent } from '../utils/http';
import { messageService } from '../services/message.service';

const uid = (req: Request) => req.user!._id.toString();

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const msg = await messageService.send({
    chatId: req.params.id!,
    senderId: uid(req),
    type: req.body.type,
    text: req.body.text,
    attachments: req.body.attachments,
    replyTo: req.body.replyTo,
    forwardedFrom: req.body.forwardedFrom,
    mentions: req.body.mentions,
    metadata: req.body.metadata,
  });
  return created(res, { message: msg.toJSON() });
});

export const listMessages = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 30);
  const before = req.query.before as string | undefined;
  const messages = await messageService.list(req.params.id!, uid(req), limit, before);
  return ok(res, { messages: messages.map((m) => m.toJSON()), hasMore: messages.length === limit });
});

export const editMessage = catchAsync(async (req: Request, res: Response) => {
  const msg = await messageService.edit(req.params.id!, uid(req), req.body.text);
  return ok(res, { message: msg.toJSON() });
});

export const deleteForEveryone = catchAsync(async (req: Request, res: Response) => {
  await messageService.deleteForEveryone(req.params.id!, uid(req));
  return noContent(res);
});

export const deleteForMe = catchAsync(async (req: Request, res: Response) => {
  await messageService.deleteForMe(req.params.id!, uid(req));
  return noContent(res);
});

export const react = catchAsync(async (req: Request, res: Response) => {
  const msg = await messageService.toggleReaction(req.params.id!, uid(req), req.body.emoji);
  return ok(res, { reactions: msg.reactions });
});

export const star = catchAsync(async (req: Request, res: Response) => {
  const starred = await messageService.toggleStar(req.params.id!, uid(req));
  return ok(res, { starred });
});

export const listStarred = catchAsync(async (req: Request, res: Response) => {
  const messages = await messageService.listStarred(uid(req));
  return ok(res, { messages: messages.map((m) => m.toJSON()) });
});

export const forward = catchAsync(async (req: Request, res: Response) => {
  const messages = await messageService.forward(req.params.id!, uid(req), req.body.chatIds);
  return created(res, { messages: messages.map((m) => m.toJSON()) });
});

export const markSeen = catchAsync(async (req: Request, res: Response) => {
  await messageService.markSeen(req.params.id!, uid(req), req.body.upToMessageId);
  return noContent(res);
});

export const searchMessages = catchAsync(async (req: Request, res: Response) => {
  const messages = await messageService.search(req.params.id!, uid(req), String(req.query.q));
  return ok(res, { messages: messages.map((m) => m.toJSON()) });
});
