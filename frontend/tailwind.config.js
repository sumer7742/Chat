/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e9fbf0',
          100: '#c9f5da',
          400: '#3ddc84',
          500: '#25d366',
          600: '#1eb257',
          700: '#128c7e',
          900: '#075e54',
        },
        // Driven by CSS variables so the active theme recolors the whole app.
        // Channels (R G B) allow Tailwind opacity modifiers, e.g. bg-accent-500/10.
        accent: {
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
        },
        surface: {
          light: '#ffffff',
          muted: '#f6f7fb',
          dark: '#000000',
          panel: '#0a0a0a',
          hover: '#1c1c1c',
        },
        // Romantic "Princess" palette.
        princess: {
          pink: '#FF5FA2',
          purple: '#C084FC',
          rose: '#F472B6',
          dark: '#16141F',
          light: '#FFF7FB',
          gold: '#E8C6A0',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        glow: '0 10px 30px -8px rgb(var(--glow) / 0.55)',
        card: '0 4px 20px -4px rgba(15,23,42,0.12)',
      },
      backgroundImage: {
        'gradient-primary':
          'linear-gradient(135deg, rgb(var(--g1)) 0%, rgb(var(--g2)) 45%, rgb(var(--g3)) 100%)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'none' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
          '33%': { transform: 'translateY(-24px) translateX(16px) scale(1.05)' },
          '66%': { transform: 'translateY(16px) translateX(-16px) scale(0.97)' },
        },
        'heart-rise': {
          '0%': { transform: 'translateY(0) scale(0.6) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-110vh) scale(1.1) rotate(20deg)', opacity: '0' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.25)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out',
        'pop-in': 'pop-in .12s ease-out',
        float: 'float 18s ease-in-out infinite',
        'heart-rise': 'heart-rise linear infinite',
        heartbeat: 'heartbeat 1.6s ease-in-out infinite',
        shimmer: 'shimmer 6s ease infinite',
      },
    },
  },
  plugins: [],
};
