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
          500: '#6551F3',
          400: '#8B7CFF',
          100: '#F5F7FA',
          50: '#F8F6FF',
        },
        mint: {
          500: '#10B981',
          100: '#B8E0C8',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
} satisfies Config;
