import { z } from 'zod';
import { objectId } from './common';
import { MessageType } from '../models/enums';

const attachment = z.object({
  url: z.string(),
  mimeType: z.string(),
  fileName: z.string(),
  size: z.number().int().nonnegative(),
  width: z.number().optional(),
  height: z.number().optional(),
  durationMs: z.number().optional(),
  thumbnailUrl: z.string().optional(),
});

export const sendMessageSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      type: z
        .enum(Object.values(MessageType) as [string, ...string[]])
        .default(MessageType.Text),
      text: z.string().max(8000).optional(),
      attachments: z.array(attachment).max(20).optional(),
      replyTo: objectId.optional(),
      forwardedFrom: objectId.optional(),
      mentions: z.array(objectId).max(128).optional(),
      metadata: z.record(z.unknown()).optional(),
    })
    .refine((v) => Boolean(v.text?.trim()) || (v.attachments && v.attachments.length > 0) || v.type !== MessageType.Text, {
      message: 'Message must have text or attachments',
    }),
});

export const listMessagesSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(30),
    before: objectId.optional(),
  }),
});

export const editMessageSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ text: z.string().min(1).max(8000) }),
});

export const reactionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ emoji: z.string().min(1).max(16) }),
});

export const forwardSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ chatIds: z.array(objectId).min(1).max(20) }),
});

export const seenSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ upToMessageId: objectId }),
});

export const searchMessagesSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({ q: z.string().min(1).max(128) }),
});
