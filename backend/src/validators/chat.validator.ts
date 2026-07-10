import { z } from 'zod';
import { objectId } from './common';
import { ChatType, MemberRole } from '../models/enums';

export const createPrivateSchema = z.object({
  body: z.object({ userId: objectId }),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(128),
    description: z.string().max(500).optional(),
    memberIds: z.array(objectId).max(512).default([]),
    type: z
      .enum([ChatType.Group, ChatType.Channel, ChatType.Broadcast] as [string, ...string[]])
      .optional(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(1).max(128).optional(),
    description: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const membersSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ memberIds: z.array(objectId).min(1).max(512) }),
});

export const memberParamSchema = z.object({
  params: z.object({ id: objectId, userId: objectId }),
});

export const setRoleSchema = z.object({
  params: z.object({ id: objectId, userId: objectId }),
  body: z.object({
    role: z.enum([MemberRole.Owner, MemberRole.Moderator, MemberRole.Member] as [string, ...string[]]),
  }),
});

export const inviteSchema = z.object({
  body: z.object({ code: z.string().min(4).max(32) }),
});

export const memberFlagsSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    archived: z.boolean().optional(),
    pinned: z.boolean().optional(),
    muted: z.boolean().optional(),
    draft: z.string().max(8000).optional(),
  }),
});

export const pinMessageSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ messageId: objectId, pin: z.boolean().default(true) }),
});
