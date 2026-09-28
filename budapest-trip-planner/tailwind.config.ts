import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: {
          bg: '#0B0D12',
          surface: '#14171F',
          surface2: '#1C2029',
          border: '#262B36',
        },
        accent: {
          gold: '#F0B429',
          violet: '#8B5CF6',
          teal: '#2DD4BF',
          rose: '#FB7185',
        },
        ink: {
          primary: '#F5F6F8',
          secondary: '#A3A9B8',
          muted: '#6B7180',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(240,180,41,0.25), 0 8px 24px -8px rgba(240,180,41,0.35)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
