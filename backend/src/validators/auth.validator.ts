import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/\d/, 'Must contain a number');

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    username: z
      .string()
      .min(3)
      .max(32)
      .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, "_" and "." allowed'),
    displayName: z.string().min(1).max(64),
    password,
    avatarUrl: z.string().max(512).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or username required'),
    password: z.string().min(1),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    otp: z.string().min(4).max(8),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase() }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(10), password }),
});

export const changePasswordSchema = z.object({
  body: z.object({ currentPassword: z.string().min(1), newPassword: password }),
});
