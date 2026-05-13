/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        'tr-bg': '#141414',
        'tr-header': '#1a1a1a',
        'tr-surface': '#1e1e1e',
        'tr-hover': '#2a2a2a',
        'tr-accent': '#00a3ff',
        'tr-accent-hover': '#0090e0',
        'tr-text': '#ffffff',
        'tr-text-secondary': '#b3b3b3',
        'tr-text-muted': '#808080',
        'tr-border': '#2a2a2a',
        'tr-search': '#2a2a2a',

        // Legacy tokens still used by some pages/components
        background: 'var(--color-bg-primary)',
        panel: 'var(--color-bg-surface)',
        'ticket-blue': 'var(--color-accent)',
        'ticket-green': '#00c853',
        success: '#00c853',
      },
    },
  },
  plugins: [],
}
