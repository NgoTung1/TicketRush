/** @type {import('tailwindcss').Config} */
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
      },
    },
  },
  plugins: [],
}
