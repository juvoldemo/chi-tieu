/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 18px 50px rgba(134, 92, 18, 0.16)',
        soft: '0 10px 34px rgba(185, 129, 28, 0.16)',
      },
      colors: {
        aqua: '#ffe08a',
        lagoon: '#d89614',
        milk: '#fffaf0',
        ink: '#3f2c12',
      },
    },
  },
  plugins: [],
};
