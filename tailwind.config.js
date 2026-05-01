/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 18px 50px rgba(112, 72, 12, 0.22)',
        soft: '0 10px 30px rgba(164, 104, 12, 0.22)',
      },
      colors: {
        aqua: '#f5c242',
        lagoon: '#b77905',
        milk: '#fffaf0',
        ink: '#2f210d',
      },
    },
  },
  plugins: [],
};
