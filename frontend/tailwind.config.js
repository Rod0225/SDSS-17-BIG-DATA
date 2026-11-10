/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        star: '#0284C7',     // Deep Sky Blue (High visibility on projectors)
        galaxy: '#7E22CE',   // Deep Purple
        qso: '#D97706',      // Deep Amber / Gold
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
