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
        // White + pink palette — every color below is white or a shade of pink,
        // differentiated by saturation/darkness rather than by hue, so semantic
        // meaning (primary/success/danger) still reads even within one family.
        base: {
          bg: '#FFFFFF',
          surface: '#FFF6FA',
          surface2: '#FDE7F1',
          border: '#F9C9DE',
        },
        accent: {
          gold: '#EC4899', // primary CTA / highlight (hot pink)
          violet: '#F472B6', // secondary accent (medium pink)
          teal: '#DB2777', // success / "done" (deep pink)
          rose: '#E11D48', // danger / dismiss (rose-red)
        },
        ink: {
          primary: '#3B0A24',
          secondary: '#8B5D75',
          muted: '#C48DA8',
        },
        // Night/atmospheric variants of the SAME pink brand family — used
        // by the hero and weather surfaces to feel cinematic after dark
        // without introducing an unrelated color family (Phase 6b).
        night: {
          bg: '#1A0511',
          surface: '#2A0B1D',
          ink: '#FCE7F1',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(219,39,119,0.18)',
        glow: '0 0 0 1px rgba(236,72,153,0.25), 0 8px 24px -8px rgba(236,72,153,0.35)',
        hero: '0 24px 60px -20px rgba(59,10,36,0.45)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        'rain-fall': {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '15%': { opacity: '0.6' },
          '100%': { transform: 'translateY(120%)', opacity: '0' },
        },
        'drift': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3.5s ease-in-out infinite',
        'rain-fall': 'rain-fall 1.1s linear infinite',
        'drift': 'drift 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
