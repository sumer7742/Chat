/**
 * Color themes. Each theme drives CSS variables (RGB channels) that the whole
 * app reads through Tailwind (accent-*, gradient-primary, shadow-glow).
 * A theme sets the accent + gradient identity; light/dark is a separate toggle,
 * so effectively there are 10 themes × 2 modes.
 */
export interface Theme {
  id: string;
  name: string;
  /** gradient stops "R G B" */
  g1: string;
  g2: string;
  g3: string;
  /** accent scale "R G B" */
  a400: string;
  a500: string;
  a600: string;
  /** glow "R G B" (usually a500) */
  glow: string;
}

export const THEMES: Theme[] = [
  { id: 'princess',  name: '👑 Princess', g1: '255 95 162',  g2: '244 114 182', g3: '192 132 252', a400: '255 138 187', a500: '255 95 162', a600: '236 72 153', glow: '255 95 162' },
  { id: 'aurora',    name: 'Aurora',    g1: '99 102 241',  g2: '139 92 246',  g3: '236 72 153',  a400: '167 139 250', a500: '139 92 246', a600: '124 58 237', glow: '139 92 246' },
  { id: 'sunset',    name: 'Sunset',    g1: '251 146 60',  g2: '244 63 94',   g3: '217 70 239',  a400: '251 113 133', a500: '244 63 94',  a600: '225 29 72',  glow: '244 63 94'  },
  { id: 'ocean',     name: 'Ocean',     g1: '34 211 238',  g2: '59 130 246',  g3: '99 102 241',  a400: '56 189 248',  a500: '14 165 233', a600: '2 132 199',  glow: '14 165 233' },
  { id: 'forest',    name: 'Forest',    g1: '52 211 153',  g2: '16 185 129',  g3: '5 150 105',   a400: '52 211 153',  a500: '16 185 129', a600: '5 150 105',  glow: '16 185 129' },
  { id: 'candy',     name: 'Candy',     g1: '244 114 182', g2: '232 121 249', g3: '168 85 247',  a400: '244 114 182', a500: '236 72 153', a600: '219 39 119', glow: '236 72 153' },
  { id: 'midnight',  name: 'Midnight',  g1: '79 70 229',   g2: '109 40 217',  g3: '30 58 138',   a400: '129 140 248', a500: '99 102 241', a600: '79 70 229',  glow: '99 102 241' },
  { id: 'fire',      name: 'Fire',      g1: '251 191 36',  g2: '249 115 22',  g3: '239 68 68',   a400: '251 146 60',  a500: '249 115 22', a600: '234 88 12',  glow: '249 115 22' },
  { id: 'lavender',  name: 'Lavender',  g1: '196 181 253', g2: '167 139 250', g3: '244 114 182', a400: '196 181 253', a500: '167 139 250', a600: '139 92 246', glow: '167 139 250' },
  { id: 'mint',      name: 'Mint',      g1: '45 212 191',  g2: '20 184 166',  g3: '34 211 238',  a400: '45 212 191',  a500: '20 184 166', a600: '13 148 136', glow: '20 184 166' },
  { id: 'rosegold',  name: 'Rose Gold', g1: '251 191 36',  g2: '251 113 133', g3: '244 114 182', a400: '251 191 36',  a500: '251 113 133', a600: '244 63 94', glow: '251 113 133' },
];

export const DEFAULT_THEME_ID = 'princess';

/**
 * Chat wallpapers. Each id maps to a `[data-chatbg="…"]` CSS rule in index.css
 * that paints the message list background. `preview` is a small CSS background
 * used for the swatch in the theme picker.
 */
export interface ChatBg {
  id: string;
  name: string;
  preview: string;
}

export const CHAT_BGS: ChatBg[] = [
  { id: 'default', name: 'Pattern', preview: 'repeating-linear-gradient(45deg, #e2e8f0 0 6px, #f6f7fb 6px 12px)' },
  { id: 'love',     name: '💕 Love',  preview: 'linear-gradient(135deg, #fecdd3 0%, #fbcfe8 100%)' },
  { id: 'stars',    name: '✨ Stars', preview: 'radial-gradient(circle at 30% 30%, #a78bfa 1px, transparent 1.5px) 0 0 / 10px 10px, #1e1b4b' },
  { id: 'plain',    name: 'Plain',    preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
];

export const DEFAULT_CHAT_BG_ID = 'love';

/** Applies the selected chat wallpaper to the document root. */
export function applyChatBg(id: string): void {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-chatbg', id);
}

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}

/** CSS gradient string for previews (uses full commas, not var-based). */
export function themeGradientCss(t: Theme): string {
  return `linear-gradient(135deg, rgb(${t.g1}) 0%, rgb(${t.g2}) 45%, rgb(${t.g3}) 100%)`;
}

/** Applies a theme's variables to the document root. */
export function applyThemeVars(t: Theme): void {
  const s = document.documentElement.style;
  s.setProperty('--g1', t.g1);
  s.setProperty('--g2', t.g2);
  s.setProperty('--g3', t.g3);
  s.setProperty('--accent-400', t.a400);
  s.setProperty('--accent-500', t.a500);
  s.setProperty('--accent-600', t.a600);
  s.setProperty('--glow', t.glow);
}
