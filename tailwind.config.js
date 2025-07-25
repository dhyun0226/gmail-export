/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6', // blue-500
          dark: '#1d4ed8',  // blue-700
        },
        secondary: {
          DEFAULT: '#6b7280', // gray-500
          light: '#9ca3af', // gray-400
          dark: '#4b5563',  // gray-600
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500
          light: '#34d399', // emerald-400
          dark: '#059669',  // emerald-600
        },
        background: '#f9fafb', // gray-50
        text: {
          DEFAULT: '#1f2937', // gray-800
          light: '#4b5563',  // gray-600
        }
      }
    },
  },
  plugins: [],
}