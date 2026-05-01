/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 18px 50px rgba(0, 91, 170, 0.14)',
        soft: '0 10px 30px rgba(0, 91, 170, 0.2)',
      },
      colors: {
        aqua: '#00A3E0',
        lagoon: '#005BAA',
        milk: '#F2F2F7',
        ink: '#1C1C1E',
      },
    },
  },
  plugins: [],
};
