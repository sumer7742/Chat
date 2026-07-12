import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok } from '../utils/http';
import { coupleService } from '../services/couple.service';

export const myCouple = catchAsync(async (req: Request, res: Response) => {
  const couple = await coupleService.getForUser(req.user!._id.toString());
  return ok(res, { couple });
});

export const joinCouple = catchAsync(async (req: Request, res: Response) => {
  const couple = await coupleService.join(req.user!._id.toString(), req.body.inviteCode);
  return ok(res, { couple });
});

export const verifyCode = catchAsync(async (req: Request, res: Response) => {
  const valid = await coupleService.verifyCode(req.user!._id.toString(), req.body.inviteCode);
  return ok(res, { valid });
});

export const setNickname = catchAsync(async (req: Request, res: Response) => {
  const couple = await coupleService.setNickname(req.user!._id.toString(), req.body.nickname);
  return ok(res, { couple });
});
