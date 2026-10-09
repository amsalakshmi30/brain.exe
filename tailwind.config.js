/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Agently-style electric blue ──────────────────────────
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',   // primary CTA
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // ── Indigo / violet accent ───────────────────────────────
        accent: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // ── Status colors ─────────────────────────────────────────
        danger: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        warn:   { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        success:{ 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        // ── Light surfaces ───────────────────────────────────────
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8faff',   // page bg — very subtle blue tint
          100: '#f1f5ff',   // card bg
          200: '#e8eeff',   // hover
          card: 'rgba(255,255,255,0.9)',
          dark: '#0f172a',
        },
        // ── Text shades ──────────────────────────────────────────
        ink: {
          900: '#0f172a',   // headings
          700: '#334155',   // body
          500: '#64748b',   // muted
          300: '#cbd5e1',   // placeholder
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.15) 0%, transparent 70%)',
        'blue-blob': 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(37,99,235,0.12) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-brand': '0 0 40px rgba(37,99,235,0.25)',
        'glow-sm':    '0 0 16px rgba(37,99,235,0.15)',
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':    '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'card-lg':    '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 20px 60px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        'blue':       '0 8px 32px rgba(37,99,235,0.3)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'fade-up':    'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
