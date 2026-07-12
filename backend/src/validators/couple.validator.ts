import { z } from 'zod';

export const joinCoupleSchema = z.object({
  body: z.object({
    inviteCode: z
      .string()
      .trim()
      .min(4, 'Enter your partner\'s invite code')
      .max(16)
      .transform((s) => s.toUpperCase()),
  }),
});

export const nicknameSchema = z.object({
  body: z.object({
    nickname: z.string().trim().min(1, 'Choose a nickname').max(30, 'Max 30 characters'),
  }),
});
