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
        surface: {
          light: '#ffffff',
          muted: '#f0f2f5',
          dark: '#111b21',
          panel: '#202c33',
          hover: '#2a3942',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'none' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out',
        'pop-in': 'pop-in .12s ease-out',
      },
    },
  },
  plugins: [],
};
