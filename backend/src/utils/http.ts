import type { Response } from 'express';

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function ok<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function created<T>(res: Response, data: T): Response {
  return ok(res, data, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function paginate<T>(items: T[], page: number, limit: number, total: number): Paginated<T> {
  return { items, page, limit, total, hasMore: page * limit < total };
}
