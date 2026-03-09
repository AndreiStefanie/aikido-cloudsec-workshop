import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        aikido: {
          950: '#010124',
          900: '#1A1D3A',
          800: '#252849',
          700: '#322050',
          500: '#6551F3',
          400: '#8B7CFF',
          100: '#F5F7FA',
          50: '#F8F6FF',
        },
        mint: {
          500: '#10B981',
          100: '#B8E0C8',
        },
        mist: '#D9E0F3',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 60px rgba(1, 1, 36, 0.38)',
      },
    },
  },
  plugins: [forms],
} satisfies Config;
