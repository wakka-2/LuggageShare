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
        // V2 Design System palette
        v2: {
          primary: '#7C6AFF',
          'primary-light': '#9D8FFF',
          'primary-lighter': '#B4ABFF',
          secondary: '#FF6B9D',
          mint: '#56D8B1',
          amber: '#FFBE5C',
          sky: '#5CB8FF',
          bg: '#F8F5FF',
          text: '#2D2B3D',
          'text-soft': '#6E6B8A',
          'text-muted': '#A8A5C0',
          'card-shadow': 'rgba(124, 106, 255, 0.12)',
        },
        // Keep legacy primary scale for compatibility
        primary: {
          50: '#F8F5FF',
          100: '#EDE8FF',
          200: '#D5CCFF',
          300: '#B4ABFF',
          400: '#9D8FFF',
          500: '#7C6AFF',
          600: '#7C6AFF',
          700: '#6A58E8',
          800: '#5645D1',
          900: '#4535AA',
        },
        success: {
          500: '#56D8B1',
          600: '#3FC99E',
        },
        warning: {
          500: '#FFBE5C',
          600: '#F0A83D',
        },
        error: {
          500: '#FF6B9D',
          600: '#E85588',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'v2-card': '22px',
        'v2-button': '50px',
        'v2-input': '50px',
        'v2-pill': '50px',
        'v2-hero': '28px',
      },
      boxShadow: {
        'bubble-xs': '0 2px 8px rgba(124, 106, 255, 0.08)',
        'bubble-sm': '0 4px 16px rgba(124, 106, 255, 0.10)',
        'bubble-md': '0 8px 30px rgba(124, 106, 255, 0.12)',
        'bubble-lg': '0 12px 40px rgba(124, 106, 255, 0.15)',
        'bubble-glow': '0 0 20px rgba(124, 106, 255, 0.25)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
