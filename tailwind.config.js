/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#10B981',
        accent: '#F97316',
        neutral: '#6B7280',
        light: '#F3F4F6',
        dark: '#1F2937',
        aiMessage: '#EBF4FF',
        userMessage: '#E6FFFA'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}