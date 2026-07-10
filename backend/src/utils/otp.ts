import crypto from 'node:crypto';
import { env } from '../config/env';

/** Generates a numeric OTP of configured length using a cryptographically-secure RNG. */
export function generateOtp(length: number = env.OTP_LENGTH): string {
  let out = '';
  while (out.length < length) {
    out += crypto.randomInt(0, 10).toString();
  }
  return out.slice(0, length);
}
