import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok, noContent } from '../utils/http';
import { userService } from '../services/user.service';
import { realtime } from '../socket/emitter';

export const getMe = catchAsync(async (req: Request, res: Response) =>
  ok(res, { user: req.user!.toJSON() }),
);

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.userId!);
  return ok(res, { user: user.toJSON() });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!._id.toString(), req.body);
  realtime.userUpdated(user._id.toString(), user.toJSON());
  return ok(res, { user: user.toJSON() });
});

export const updatePrivacy = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updatePrivacy(req.user!._id.toString(), req.body);
  return ok(res, { user: user.toJSON() });
});

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.search(String(req.query.q), req.user!._id.toString());
  return ok(res, { users: users.map((u) => u.toJSON()) });
});

export const blockUser = catchAsync(async (req: Request, res: Response) => {
  await userService.block(req.user!._id.toString(), req.params.userId!);
  return noContent(res);
});

export const unblockUser = catchAsync(async (req: Request, res: Response) => {
  await userService.unblock(req.user!._id.toString(), req.params.userId!);
  return noContent(res);
});

export const muteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.mute(req.user!._id.toString(), req.params.userId!);
  return noContent(res);
});

export const unmuteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.unmute(req.user!._id.toString(), req.params.userId!);
  return noContent(res);
});

export const listSessions = catchAsync(async (req: Request, res: Response) => {
  const sessions = await userService.listSessions(req.user!._id.toString(), req.sessionId);
  return ok(res, { sessions });
});

export const revokeSession = catchAsync(async (req: Request, res: Response) => {
  await userService.revokeSession(req.user!._id.toString(), req.params.sessionId!);
  return noContent(res);
});
