/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#fdf8f0',
          100: '#f9eedb',
          200: '#f2dbb6',
          300: '#e8c28a',
          400: '#dca660',
          500: '#cc8c3c',
        },
        dnd: {
          red:    '#8b1a1a',
          gold:   '#c9a84c',
          dark:   '#1a1a2e',
          darker: '#0f0f1a',
          card:   '#16213e',
          border: '#2a2a4a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
