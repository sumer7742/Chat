import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ok, created, noContent } from '../utils/http';
import { authService } from '../services/auth.service';
import { setAuthCookies, clearAuthCookies, cookieNames } from '../utils/cookies';
import { deviceNameFromUserAgent, clientIp } from '../utils/device';
import { ApiError } from '../utils/ApiError';
import type { DeviceContext } from '../services/token.service';

function deviceOf(req: Request): DeviceContext {
  const userAgent = req.headers['user-agent'] ?? '';
  return { userAgent, ip: clientIp(req), deviceName: deviceNameFromUserAgent(userAgent) };
}

function refreshTokenFrom(req: Request): string {
  const fromCookie = req.cookies?.[cookieNames.REFRESH_COOKIE];
  const token = fromCookie ?? req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token missing');
  return token;
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.register(req.body, deviceOf(req));
  setAuthCookies(res, accessToken, refreshToken);
  // refreshToken is returned in the body too so cookieless clients (mobile) can
  // persist it in secure storage; web ignores it and relies on the httpOnly cookie.
  return created(res, { user: user.toJSON(), accessToken, refreshToken });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(identifier, password, deviceOf(req));
  setAuthCookies(res, accessToken, refreshToken);
  return ok(res, { user: user.toJSON(), accessToken, refreshToken });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.refresh(refreshTokenFrom(req), deviceOf(req));
  setAuthCookies(res, accessToken, refreshToken);
  return ok(res, { accessToken, refreshToken });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  if (req.sessionId) await authService.logout(req.sessionId);
  clearAuthCookies(res);
  return noContent(res);
});

export const logoutAll = catchAsync(async (req: Request, res: Response) => {
  const count = await authService.logoutAll(req.user!._id.toString());
  clearAuthCookies(res);
  return ok(res, { revoked: count });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyOtp(req.body.email, req.body.otp);
  return ok(res, { verified: true });
});

export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  await authService.issueOtp(req.body.email);
  return ok(res, { sent: true });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body.email);
  return ok(res, { message: 'If the account exists, a reset link has been sent' });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  return ok(res, { reset: true });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!, req.body.currentPassword, req.body.newPassword);
  return ok(res, { changed: true });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  return ok(res, { user: req.user!.toJSON() });
});
