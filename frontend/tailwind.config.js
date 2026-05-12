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
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
        logo: [...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: '#111111',
        panel: '#1f1f1f',
        primary: '#1890ff',
        success: '#10b981', // Tailwind emerald-500 or slightly brighter
        'ticket-green': '#00e54b',
        'ticket-blue': '#2196f3',
      }
    },
  },
  plugins: [],
}
