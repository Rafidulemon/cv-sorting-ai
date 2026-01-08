import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fcebf5',
          100: '#f8d3e8',
          200: '#f3b0d6',
          300: '#ec84c0',
          400: '#e452a6',
          500: '#d80880',
          600: '#b8076d',
          700: '#97065a',
          800: '#770446',
          900: '#560333',
          DEFAULT: '#d80880',
        },
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ff4a52',
          600: '#e53e47',
          700: '#cc343e',
          800: '#b32a35',
          900: '#99222c',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        },
        hero: {
          base: '#180a2a',
          mid: '#581c87',
          glow: '#8b5cf6',
        },
      },
      boxShadow: {
        'glow-primary': '0 20px 45px -20px rgba(216, 8, 128, 0.35)',
        'glow-accent': '0 20px 45px -18px rgba(255, 74, 82, 0.32)',
        'card-soft': '0 30px 40px -25px rgba(24, 27, 49, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-overlay':
          'radial-gradient(1200px 600px at 50% 15%, rgba(139, 92, 246, 0.45), rgba(24, 10, 42, 0.0)), linear-gradient(180deg, rgba(88, 28, 135, 0.55), rgba(24, 10, 42, 0.95))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.12)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
