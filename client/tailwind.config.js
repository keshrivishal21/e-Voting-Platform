/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#111827',
        'blue-300': '#93c5fd',
        'blue-400': '#60a5fa',
        'blue-600': '#2563eb',
        'blue-900': '#1e3a8a',
      },
      backdropBlur: {
        'lg': '16px',
      }
    },
  },
  plugins: [],
}
