/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'magic-cream': '#F7F1E6',
        'magic-pink': '#E8743B',
        'magic-gold': '#D9A441',
        'magic-turquoise': '#7EA89A',
        'magic-purple': '#8A5A3C',
        'magic-orange': '#F08A33',
      },
      fontFamily: {
        magic: ['Nunito', 'Arial', 'sans-serif'],
      },
      borderWidth: {
        3: '3px',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
