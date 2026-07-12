/**
 * Client-side data model for the romantic "Princess" features (Love Dashboard,
 * Letters, Surprises, Memories). Persisted in localStorage via loveStore — no
 * backend required, so everything works offline and privately on-device.
 */

export interface LoveConfig {
  princessName: string;
  yourName: string;
  /** ISO dates (yyyy-mm-dd) */
  firstMeet: string;
  firstHug: string;
  firstGift: string;
  anniversary: string; // month-day recurring
  princessBirthday: string;
  nextMeeting: string; // upcoming date-time ISO
}

export interface LoveLetter {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  /** if set, letter stays sealed until this date */
  unlockAt?: string;
  locked: boolean;
  favorite: boolean;
}

export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  date: string; // yyyy-mm-dd
  favorite: boolean;
}

export type WishCategory = 'destinations' | 'movies' | 'food' | 'shopping' | 'plans';

export interface WishItem {
  id: string;
  category: WishCategory;
  title: string;
  note?: string;
  done: boolean;
}

export const WISH_CATEGORIES: { id: WishCategory; label: string; emoji: string }[] = [
  { id: 'destinations', label: 'Destinations', emoji: '✈️' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'plans', label: 'Future Plans', emoji: '💫' },
];

export interface CoupleEvent {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  type: 'anniversary' | 'birthday' | 'date' | 'event';
  recurring: boolean;
}

export const EVENT_TYPES: { id: CoupleEvent['type']; label: string; emoji: string }[] = [
  { id: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'date', label: 'Date', emoji: '🌹' },
  { id: 'event', label: 'Event', emoji: '🎉' },
];

export interface LoveSettings {
  pin: string; // '' = no lock
  fontId: string;
  onboarded: boolean;
  /** The one chat that belongs to "my Princess". '' until chosen. */
  partnerChatId: string;
}

export const DEFAULT_SETTINGS: LoveSettings = { pin: '', fontId: 'poppins', onboarded: false, partnerChatId: '' };

export const FONTS: { id: string; label: string; stack: string }[] = [
  { id: 'poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { id: 'quicksand', label: 'Quicksand', stack: "'Quicksand', sans-serif" },
  { id: 'nunito', label: 'Nunito', stack: "'Nunito', sans-serif" },
  { id: 'inter', label: 'Inter', stack: "'Inter', sans-serif" },
];

export function applyFont(id: string): void {
  if (typeof document === 'undefined') return;
  const f = FONTS.find((x) => x.id === id) ?? FONTS[0]!;
  document.documentElement.style.setProperty('--app-font', f.stack);
}

export const DEFAULT_LOVE_CONFIG: LoveConfig = {
  princessName: 'My Princess',
  yourName: 'Me',
  firstMeet: '',
  firstHug: '',
  firstGift: '',
  anniversary: '',
  princessBirthday: '',
  nextMeeting: '',
};

/** Random compliments for the Surprise section. */
export const COMPLIMENTS: string[] = [
  'You are the most beautiful thought I never want to end. 💗',
  'Every love story is special, but ours is my favorite. 💕',
  'You make ordinary moments feel like magic. ✨',
  "I fall for you a little more every single day. 🌹",
  'Your smile is my favorite view in the whole world. 🥰',
  'Being loved by you is the best thing that ever happened to me. 💖',
  'You are my today and all of my tomorrows. 💫',
  'Home is not a place, it is you. 🏡❤️',
  'You are proof that soulmates are real. 👑',
  'I love you more than yesterday and less than tomorrow. 💌',
];

export const SURPRISES = [
  { id: 'flower', emoji: '🌹', title: 'A bouquet for you', message: 'A dozen roses, each one less beautiful than you.' },
  { id: 'choco', emoji: '🍫', title: 'Sweet treat', message: 'Something sweet, but never as sweet as you.' },
  { id: 'teddy', emoji: '🧸', title: 'A warm hug', message: 'Sending you the biggest, softest hug. Hold tight.' },
  { id: 'star', emoji: '⭐', title: 'A wish', message: 'I wished on a star tonight — for forever with you.' },
  { id: 'ring', emoji: '💍', title: 'A promise', message: 'My promise: to choose you, every day, always.' },
  { id: 'cake', emoji: '🎂', title: 'A little celebration', message: 'Celebrating you, just for being you.' },
];

const MS_DAY = 1000 * 60 * 60 * 24;

/** Whole days between an ISO date and now (positive = in the past). */
export function daysSince(iso: string, now: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / MS_DAY);
}

/** Countdown parts to a future ISO date-time. Null if past/empty. */
export function countdownTo(iso: string, now: Date) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / MS_DAY);
  const hours = Math.floor((diff % MS_DAY) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

/** Days until the next occurrence of a recurring month-day date. */
export function daysUntilRecurring(iso: string, now: Date): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const year = now.getFullYear();
  let next = new Date(year, d.getMonth(), d.getDate());
  if (next.getTime() < new Date(year, now.getMonth(), now.getDate()).getTime()) {
    next = new Date(year + 1, d.getMonth(), d.getDate());
  }
  return Math.round((next.getTime() - new Date(year, now.getMonth(), now.getDate()).getTime()) / MS_DAY);
}

export function prettyDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Days until the next occurrence of an event (recurring → this/next year). */
export function daysUntilEvent(ev: CoupleEvent, now: Date): number | null {
  if (ev.recurring) return daysUntilRecurring(ev.date, now);
  return daysSince(ev.date, now) !== null ? -daysSince(ev.date, now)! : null;
}
