import type { CookieOptions, Response } from 'express';
import { env, isProd } from '../config/env';

const REFRESH_COOKIE = 'refreshToken';
const ACCESS_COOKIE = 'accessToken';

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
  };
}

/** Parse a duration string like "15m" / "30d" / "3600s" into milliseconds. */
export function durationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return Number(value) || 0;
  const n = Number(match[1]);
  const unit = match[2];
  const factor = unit === 's' ? 1e3 : unit === 'm' ? 6e4 : unit === 'h' ? 36e5 : 864e5;
  return n * factor;
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions(),
    maxAge: durationToMs(env.JWT_ACCESS_TTL),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions(),
    maxAge: durationToMs(env.JWT_REFRESH_TTL),
    path: '/api/v1/auth',
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions() });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(), path: '/api/v1/auth' });
}

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE };
