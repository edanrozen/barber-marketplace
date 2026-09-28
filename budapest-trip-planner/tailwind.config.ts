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
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(219,39,119,0.18)',
        glow: '0 0 0 1px rgba(236,72,153,0.25), 0 8px 24px -8px rgba(236,72,153,0.35)',
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
