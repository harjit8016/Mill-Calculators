/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'floor-bg': '#FCEBEB',
        'floor-text': '#A32D2D',
        'safe-bg': '#FAEEDA',
        'safe-text': '#854F0B',
        'good-bg': '#EAF3DE',
        'good-text': '#3B6D11',
        'blue-bg': '#E6F1FB',
        'blue-text': '#185FA5',
        'amber-bg': '#FAEEDA',
        'amber-text': '#854F0B',
      },
      borderRadius: {
        md: '8px',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
