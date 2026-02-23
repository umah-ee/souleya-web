import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantische Farben aus Style Guide (CSS Variables)
        gold: {
          DEFAULT: 'var(--gold)',
          text: 'var(--gold-text)',
          deep: 'var(--gold-deep)',
        },
        th: {
          bg: 'var(--bg-solid)',
          glass: 'var(--glass)',
          'glass-border': 'var(--glass-border)',
          'nav': 'var(--glass-nav)',
          'nav-border': 'var(--glass-nav-b)',
          divider: 'var(--divider)',
          'divider-l': 'var(--divider-l)',
        },
        tx: {
          h: 'var(--text-h)',
          body: 'var(--text-body)',
          sec: 'var(--text-sec)',
          muted: 'var(--text-muted)',
          'on-gold': 'var(--text-on-gold)',
        },
        status: {
          success: 'var(--success)',
          error: 'var(--error)',
          warning: 'var(--warning)',
          purple: 'var(--event-purple)',
        },
      },
      backgroundColor: {
        'gold-bg': 'var(--gold-bg)',
        'gold-bg-hover': 'var(--gold-bg-hover)',
        'avatar': 'var(--avatar-bg)',
        'success-bg': 'var(--success-bg)',
        'error-bg': 'var(--error-bg)',
        'purple-bg': 'var(--event-purple-bg)',
      },
      borderColor: {
        'gold-b': 'var(--gold-border)',
        'gold-bs': 'var(--gold-border-s)',
        'success-b': 'var(--success-border)',
        'error-b': 'var(--error-border)',
        'purple-b': 'var(--event-purple-border)',
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        label: ['var(--font-josefin)', 'sans-serif'],
        body: ['var(--font-quicksand)', 'sans-serif'],
      },
      borderRadius: {
        xs: '10px',
        sm: '12px',
        md: '18px',
        lg: '24px',
        xl: '36px',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
