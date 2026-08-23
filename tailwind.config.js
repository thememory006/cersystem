/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mali', 'cursive', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fffbea',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        pastel: {
          pink: '#ffb3c6',
          blue: '#a0c4ff',
          green: '#caffbf',
          yellow: '#fdffb6',
          purple: '#bdb2ff',
          orange: '#ffd6a5',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
    },
  },
  plugins: [],
}
