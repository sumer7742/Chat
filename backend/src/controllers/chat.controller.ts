import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok, created, noContent, paginate } from '../utils/http';
import { chatService } from '../services/chat.service';
import { room } from '../socket/events';
import { getIo } from '../socket';

const uid = (req: Request) => req.user!._id.toString();

/** Ensures every active socket of the involved users joins the chat room. */
function joinRoom(userIds: string[], chatId: string): void {
  const io = getIo();
  if (!io) return;
  for (const id of userIds) io.to(room.user(id)).socketsJoin(room.chat(chatId));
}

export const openPrivate = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.getOrCreatePrivate(uid(req), req.body.userId);
  joinRoom(chatService.memberIdsOf(chat), chat._id.toString());
  return created(res, { chat: chat.toJSON() });
});

export const createGroup = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.createGroup(uid(req), req.body);
  joinRoom(chatService.memberIdsOf(chat), chat._id.toString());
  return created(res, { chat: chat.toJSON() });
});

export const listChats = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const archived = req.query.archived === undefined ? undefined : req.query.archived === 'true';
  const { items, total } = await chatService.listForUser(uid(req), page, limit, archived);
  return ok(res, paginate(items.map((c) => c.toJSON()), page, limit, total));
});

export const getChat = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.getForMember(req.params.id!, uid(req));
  return ok(res, { chat: chat.toJSON() });
});

export const updateGroup = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.updateGroup(req.params.id!, uid(req), req.body);
  return ok(res, { chat: chat.toJSON() });
});

export const addMembers = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.addMembers(req.params.id!, uid(req), req.body.memberIds);
  joinRoom(req.body.memberIds, chat._id.toString());
  return ok(res, { chat: chat.toJSON() });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.removeMember(req.params.id!, uid(req), req.params.userId!);
  return ok(res, { chat: chat.toJSON() });
});

export const setRole = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.setRole(req.params.id!, uid(req), req.params.userId!, req.body.role);
  return ok(res, { chat: chat.toJSON() });
});

export const joinByInvite = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.joinByInvite(uid(req), req.body.code);
  joinRoom([uid(req)], chat._id.toString());
  return ok(res, { chat: chat.toJSON() });
});

export const setFlags = catchAsync(async (req: Request, res: Response) => {
  await chatService.setMemberFlags(req.params.id!, uid(req), req.body);
  return noContent(res);
});

export const pinMessage = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.pinMessage(req.params.id!, uid(req), req.body.messageId, req.body.pin);
  return ok(res, { chat: chat.toJSON() });
});

export const leaveChat = catchAsync(async (req: Request, res: Response) => {
  await chatService.removeMember(req.params.id!, uid(req), uid(req));
  return noContent(res);
});
