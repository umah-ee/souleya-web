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
        // Dusk Accent-Farben (fallen in Gold auf --gold zurueck)
        accent2: 'var(--accent-2, var(--gold))',
        accent3: 'var(--accent-3, var(--warning))',
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
        heading: ['var(--font-cormorant)', 'Georgia', 'Times New Roman', 'serif'],
        label: ['var(--font-josefin)', 'sans-serif'],
        body: ['var(--font-quicksand)', 'sans-serif'],
      },
      borderRadius: {
        input: '8px',     // Alle Inputs, Textareas, Selects
        xs: '10px',       // Overlay-Badge
        sm: '12px',       // Badge, Tooltip
        md: '16px',       // Card
        lg: '24px',       // Button CTA
        xl: '32px',       // Grosses Element
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.92) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
