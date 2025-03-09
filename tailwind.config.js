/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dynasty-primary': '#4F46E5',
        'dynasty-secondary': '#2563EB',
        'dynasty-accent': '#EF4444',
        'dynasty-background': '#F9FAFB',
        'dynasty-text': '#1F2937',
      },
    },
  },
  plugins: [],
}
