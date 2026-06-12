/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cn: '#ef4444',
        global: '#3b82f6',
        hidden: '#6b7280',
      },
    },
  },
  plugins: [],
}
