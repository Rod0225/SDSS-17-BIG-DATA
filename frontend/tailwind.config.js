/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060911',
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        star: '#38BDF8',     // Cyan
        galaxy: '#A855F7',   // Violet
        qso: '#F59E0B',      // Amber/Gold
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

