import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const SendIcon = (p: P) => (
  <svg {...base(p)}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
);
export const BackIcon = (p: P) => (
  <svg {...base(p)}><path d="m15 18-6-6 6-6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const PaperclipIcon = (p: P) => (
  <svg {...base(p)}><path d="M21.4 11.05 12.2 20.3a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 4.9 4.9l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>
);
export const MicIcon = (p: P) => (
  <svg {...base(p)}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3" /></svg>
);
export const SmileIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>
);
export const ChecksIcon = (p: P) => (
  <svg {...base(p)}><path d="M18 6 7 17l-4-4" /><path d="m22 6-9 9" /></svg>
);
export const MoreIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
);
export const PhoneIcon = (p: P) => (
  <svg {...base(p)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
);
export const VideoIcon = (p: P) => (
  <svg {...base(p)}><path d="m23 7-7 5 7 5V7Z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
);
export const PlusIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const ReplyIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 17 4 12l5-5" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
);
export const StarIcon = (p: P) => (
  <svg {...base(p)}><path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7Z" /></svg>
);
export const TrashIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
);
export const EditIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const ForwardIcon = (p: P) => (
  <svg {...base(p)}><path d="m15 17 5-5-5-5" /><path d="M4 18v-2a4 4 0 0 1 4-4h12" /></svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 17v5M9 3h6l-1 6 3 3H7l3-3-1-6Z" /></svg>
);
export const SettingsIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1 2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></svg>
);
export const LogoutIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);
export const FileIcon = (p: P) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
);
export const PaletteIcon = (p: P) => (
  <svg {...base(p)}><circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" /><path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h1.5a4.5 4.5 0 0 0 4.5-4.5A10 10 0 0 0 12 2Z" /></svg>
);
