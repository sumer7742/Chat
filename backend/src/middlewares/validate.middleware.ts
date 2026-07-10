import type { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

type PartSchema = ZodType;
interface PartMap {
  body?: PartSchema;
  query?: PartSchema;
  params?: PartSchema;
}

/**
 * Accepts either form:
 *  - a wrapped schema  `z.object({ body?, query?, params? })`
 *  - a plain map        `{ body?, query?, params? }` of Zod schemas
 * Parsed output replaces the corresponding request part so downstream handlers
 * receive typed, coerced values.
 */
export const validate =
  (schema: ZodType | PartMap) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema instanceof ZodType) {
        const parsed = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        }) as PartMap & Record<string, unknown>;
        if ('body' in parsed) req.body = parsed.body;
        if ('query' in parsed) Object.assign(req.query, parsed.query);
        if ('params' in parsed) Object.assign(req.params, parsed.params);
      } else {
        if (schema.body) req.body = schema.body.parse(req.body);
        if (schema.query) Object.assign(req.query, schema.query.parse(req.query));
        if (schema.params) Object.assign(req.params, schema.params.parse(req.params));
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
        return;
      }
      next(err);
    }
  };
