import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok } from '../utils/http';
import { callRepository } from '../repositories/call.repository';

export const callHistory = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const calls = await callRepository.history(req.user!._id.toString(), page, limit);
  return ok(res, { calls: calls.map((c) => c.toJSON()), page, limit });
});
