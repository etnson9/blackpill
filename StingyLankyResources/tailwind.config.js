/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          'bg-secondary': '#2c2c2c',
          card: '#242424',
          'card-hover': '#2a2a2a',
          text: '#e0e0e0',
          'text-secondary': '#a0a0a0',
          border: '#3a3a3a',
          primary: '#bb86fc',
          'primary-hover': '#a058ee'
        },
      }
    },
  },
  plugins: [],
}