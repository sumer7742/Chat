import type { Request } from 'express';

/**
 * Derives a friendly device label from the User-Agent so the "active sessions"
 * screen shows "Chrome on Windows" rather than a raw UA string. Intentionally
 * lightweight — no UA-parsing dependency.
 */
export function deviceNameFromUserAgent(ua = ''): string {
  const browser =
    /edg/i.test(ua) ? 'Edge'
    : /chrome|crios/i.test(ua) ? 'Chrome'
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari'
    : /postman|insomnia|curl/i.test(ua) ? 'API client'
    : 'Browser';

  const os =
    /windows/i.test(ua) ? 'Windows'
    : /android/i.test(ua) ? 'Android'
    : /iphone|ipad|ios/i.test(ua) ? 'iOS'
    : /mac os/i.test(ua) ? 'macOS'
    : /linux/i.test(ua) ? 'Linux'
    : 'Unknown OS';

  return `${browser} on ${os}`;
}

export function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0]!.trim();
  return req.ip ?? req.socket.remoteAddress ?? '';
}
