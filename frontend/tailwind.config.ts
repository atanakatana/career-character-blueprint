import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── COLORS ──────────────────────────────────────────────────────────
      colors: {
        'pixel-bg':           '#10141F',
        'pixel-panel':        '#1C2434',
        'pixel-panel-hover':  '#243045',
        'pixel-gold':         '#F5C542',
        'pixel-gold-dark':    '#C4A033',
        'pixel-blue':         '#4DA6FF',
        'pixel-green':        '#5CE27A',
        'pixel-text':         '#F5F5F5',
        'pixel-muted':        '#8892A4',
        'pixel-border':       '#2E3B52',
        'pixel-error':        '#FF6B6B',
      },

      // ── FONTS ───────────────────────────────────────────────────────────
      // CSS variables injected by next/font in layout.tsx
      fontFamily: {
        pixel:  ['var(--font-pixelify)', 'sans-serif'],
        press:  ['var(--font-press)',    'monospace'],
        vt:     ['var(--font-vt)',       'monospace'],
        body:   ['var(--font-inter)',    'sans-serif'],
      },

      // ── FONT SIZES ───────────────────────────────────────────────────────
      // Separate scales for pixel fonts (smaller is readable) and VT323 (large and decorative)
      fontSize: {
        'press-xs':   ['0.5rem',   { lineHeight: '1.6' }],
        'press-sm':   ['0.625rem', { lineHeight: '1.6' }],
        'press-base': ['0.75rem',  { lineHeight: '1.6' }],
        'press-lg':   ['0.875rem', { lineHeight: '1.6' }],
        'press-xl':   ['1rem',     { lineHeight: '1.6' }],
        'press-2xl':  ['1.25rem',  { lineHeight: '1.6' }],
        'vt-lg':      ['1.5rem',   { lineHeight: '1' }],
        'vt-xl':      ['2rem',     { lineHeight: '1' }],
        'vt-2xl':     ['2.5rem',   { lineHeight: '1' }],
        'vt-3xl':     ['3rem',     { lineHeight: '1' }],
        'vt-4xl':     ['4rem',     { lineHeight: '1' }],
      },

      // ── SHADOWS ──────────────────────────────────────────────────────────
      boxShadow: {
        'pixel':          '4px 4px 0px rgba(0,0,0,0.6)',
        'pixel-sm':       '2px 2px 0px rgba(0,0,0,0.6)',
        'pixel-gold':     '4px 4px 0px #C4A033',
        'pixel-gold-sm':  '2px 2px 0px #C4A033',
        'pixel-blue':     '4px 4px 0px rgba(77,166,255,0.4)',
        'pixel-green':    '4px 4px 0px rgba(92,226,122,0.4)',
        'pixel-inset':    'inset 2px 2px 0px rgba(255,255,255,0.08), inset -2px -2px 0px rgba(0,0,0,0.3)',
      },

      // ── ANIMATIONS ───────────────────────────────────────────────────────
      animation: {
        'pixel-blink': 'pixel-blink 1s step-end infinite',
        'pixel-float': 'pixel-float 3s ease-in-out infinite',
        'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'pixel-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
