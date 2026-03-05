/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy:  { DEFAULT: '#0f2342', 50: '#e8f0fe', 100: '#c7d9f9' },
        brand: { DEFAULT: '#1a56db', hover: '#1d4ed8' },
      },
    },
  },
  plugins: [],
}
