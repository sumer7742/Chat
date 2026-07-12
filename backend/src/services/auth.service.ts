import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { comparePassword, hashPassword, randomToken, sha256 } from '../utils/password';
import { generateOtp } from '../utils/otp';
import { ApiError } from '../utils/ApiError';
import { emailService } from './email.service';
import { cacheService } from './cache.service';
import { tokenService, type DeviceContext, type TokenPair } from './token.service';
import { coupleService } from './couple.service';
import type { UserDocument } from '../models/User';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthResult extends TokenPair {
  user: UserDocument;
}

class AuthService {
  async register(input: RegisterInput, device: DeviceContext): Promise<AuthResult> {
    const existing = await userRepository.findByEmailOrUsername(input.email);
    if (existing) throw ApiError.conflict('Email already registered');
    if (await userRepository.findByUsername(input.username)) {
      throw ApiError.conflict('Username already taken');
    }

    const user = await userRepository.create({
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      password: await hashPassword(input.password),
      // No OTP step on signup — accounts are active immediately.
      isEmailVerified: true,
    });

    // Every new user starts a relationship of their own; a partner joins later.
    await coupleService.createForUser(user._id.toString());

    const tokens = await tokenService.issueSession(user._id.toString(), device);
    return { ...tokens, user };
  }

  async login(identifier: string, password: string, device: DeviceContext): Promise<AuthResult> {
    const user = await userRepository.findByEmailOrUsername(identifier, true);
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw ApiError.unauthorized('Invalid credentials');

    const tokens = await tokenService.issueSession(user._id.toString(), device);
    user.password = undefined as unknown as string;
    return { ...tokens, user };
  }

  async refresh(refreshToken: string, device: DeviceContext): Promise<TokenPair> {
    return tokenService.rotate(refreshToken, device);
  }

  async logout(sessionId: string): Promise<void> {
    await sessionRepository.revoke(sessionId);
  }

  async logoutAll(userId: string, exceptSessionId?: string): Promise<number> {
    return sessionRepository.revokeAllForUser(userId, exceptSessionId);
  }

  async issueOtp(email: string): Promise<void> {
    const otp = generateOtp();
    await cacheService.setOtp(email, otp, env.OTP_TTL_SECONDS);
    await emailService.sendVerificationOtp(email, otp);
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    const stored = await cacheService.getOtp(email);
    if (!stored || stored !== otp) throw ApiError.badRequest('Invalid or expired code');
    const user = await userRepository.findByEmail(email);
    if (!user) throw ApiError.notFound('User not found');
    user.isEmailVerified = true;
    await user.save();
    await cacheService.clearOtp(email);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Do not reveal whether the account exists.
    if (!user) return;
    const token = randomToken(32);
    await cacheService.setResetToken(sha256(token), user._id.toString(), 3600);
    await emailService.sendPasswordReset(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await cacheService.consumeResetToken(sha256(token));
    if (!userId) throw ApiError.badRequest('Invalid or expired reset token');
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
    // Force re-auth everywhere after a password change.
    await sessionRepository.revokeAllForUser(userId);
  }

  async changePassword(user: UserDocument, current: string, next: string): Promise<void> {
    const fresh = await userRepository.findByEmail(user.email, true);
    if (!fresh || !(await comparePassword(current, fresh.password))) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    fresh.password = await hashPassword(next);
    fresh.passwordChangedAt = new Date();
    await fresh.save();
  }
}

export const authService = new AuthService();
