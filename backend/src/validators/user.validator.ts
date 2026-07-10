import { z } from 'zod';
import { objectId } from './common';
import { PrivacyLevel } from '../models/enums';

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(64).optional(),
    bio: z.string().max(280).optional(),
    username: z
      .string()
      .min(3)
      .max(32)
      .regex(/^[a-zA-Z0-9_.]+$/)
      .optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

const privacyLevel = z.enum([
  PrivacyLevel.Everyone,
  PrivacyLevel.Contacts,
  PrivacyLevel.Nobody,
] as [string, ...string[]]);

export const updatePrivacySchema = z.object({
  body: z.object({
    lastSeen: privacyLevel.optional(),
    profilePhoto: privacyLevel.optional(),
    readReceipts: z.boolean().optional(),
  }),
});

export const searchUsersSchema = z.object({
  query: z.object({ q: z.string().min(1).max(64) }),
});

export const userIdParam = z.object({ userId: objectId });
export const sessionIdParam = z.object({ sessionId: objectId });
