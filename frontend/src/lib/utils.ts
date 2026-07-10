import clsx, { type ClassValue } from 'clsx';
import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';

export const cn = (...inputs: ClassValue[]): string => clsx(inputs);

const API = import.meta.env.VITE_API_URL ?? '';

/** Resolves a possibly-relative upload URL (e.g. "/uploads/x") to an absolute one. */
export function assetUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API}${url}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

export function formatMessageTime(iso: string): string {
  return format(new Date(iso), 'HH:mm');
}

export function formatChatTimestamp(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd/MM/yyyy');
}

export function formatLastSeen(iso?: string): string {
  if (!iso) return 'offline';
  return `last seen ${formatDistanceToNowStrict(new Date(iso), { addSuffix: true })}`;
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

/** A deterministic accent color for an id — used for avatar fallbacks. */
export function colorForId(id: string): string {
  const palette = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length]!;
}
