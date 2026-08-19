import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18211d',
        moss: '#39735a',
        mint: '#e8f5ed',
        sand: '#f7f5ef',
        coral: '#dc735d',
      },
    },
  },
  plugins: [],
} satisfies Config;
