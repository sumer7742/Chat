/** Preset nicknames for the "Personalize Your Love" flow. Gender-neutral mix. */
export const NICKNAME_PRESETS: string[] = [
  'My Love ❤️',
  'Princess 👑',
  'Prince 🤴',
  'Queen 👑',
  'King 🤴',
  'Angel 😇',
  'Sunshine ☀️',
  'Honey 🍯',
  'Babe 💕',
  'Babu 🥰',
  'Jaan ❤️',
  'Cutie 🐻',
  'Sweetheart 💗',
  'Darling 💞',
];

export const NICKNAME_MAX = 30;

/** The label to show for the partner: chosen nickname, else name, else a default. */
export function partnerLabel(nickname?: string, fallbackName?: string): string {
  const n = (nickname ?? '').trim();
  if (n) return n;
  if (fallbackName?.trim()) return fallbackName.trim();
  return 'My Love ❤️';
}
