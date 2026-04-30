import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#FAF8F4',
        fg: '#1A1A1E',
        card: '#FFFFFF',
        muted: '#7C7C82',
        border: '#EDE9E1',
        accent: '#D4F26A',
        'accent-coral': '#FF8E72',
        'accent-lavender': '#C7B8FF',
        'accent-mint': '#9EE5C5',
        'accent-yellow': '#FFD66B',
        'accent-pink': '#FFB4D1',
        'accent-blue': '#A0D8FF',
        'accent-peach': '#FFCBA0',
      },
      borderRadius: {
        DEFAULT: '16px',
        card: '20px',
        modal: '28px',
      },
    },
  },
  plugins: [],
};

export default config;
