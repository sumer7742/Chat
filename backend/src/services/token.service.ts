import { nanoid } from 'nanoid';
import { env } from '../config/env';
import { Session, type SessionDocument } from '../models/Session';
import { sha256 } from '../utils/password';
import { durationToMs } from '../utils/cookies';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface DeviceContext {
  userAgent: string;
  ip: string;
  deviceName: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  session: SessionDocument;
}

class TokenService {
  /** Issues a brand-new session (login / register) and returns the token pair. */
  async issueSession(userId: string, device: DeviceContext): Promise<TokenPair> {
    const jti = nanoid();
    const session = await Session.create({
      user: userId,
      jti,
      refreshTokenHash: 'pending',
      userAgent: device.userAgent,
      ip: device.ip,
      deviceName: device.deviceName,
      expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_TTL)),
    });

    return this.signPair(userId, session, jti);
  }

  /**
   * Rotates a refresh token. Detects reuse: if a valid-looking token no longer
   * matches the stored hash for its session, we revoke the whole session (token
   * theft mitigation).
   */
  async rotate(refreshToken: string, device: DeviceContext): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);
    const session = await Session.findOne({ _id: payload.sid, revokedAt: { $exists: false } });
    if (!session) throw ApiError.unauthorized('Session expired or revoked');

    if (session.refreshTokenHash !== sha256(refreshToken) || session.jti !== payload.jti) {
      session.revokedAt = new Date();
      await session.save();
      throw ApiError.unauthorized('Refresh token reuse detected — session revoked');
    }

    const jti = nanoid();
    session.jti = jti;
    session.lastActiveAt = new Date();
    session.ip = device.ip;
    session.userAgent = device.userAgent;
    return this.signPair(session.user.toString(), session, jti);
  }

  private async signPair(userId: string, session: SessionDocument, jti: string): Promise<TokenPair> {
    const sid = session._id.toString();
    const accessToken = signAccessToken({ sub: userId, sid });
    const refreshToken = signRefreshToken({ sub: userId, sid, jti });
    session.refreshTokenHash = sha256(refreshToken);
    await session.save();
    return { accessToken, refreshToken, session };
  }
}

export const tokenService = new TokenService();
