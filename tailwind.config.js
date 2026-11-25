/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbf9f5',
          100: '#f5f0e6',
          200: '#e9e0cf',
          300: '#d8c9b0',
        },
        ink: {
          900: '#1c1b18',
          800: '#2d2a25',
          700: '#4a453d',
          500: '#787166',
        },
        jade: {
          600: '#2e6f5e',
          500: '#3d8b76',
          100: '#e5f2ee',
        },
        cinnabar: {
          600: '#a9352b',
          500: '#c4453a',
          100: '#f9e8e6',
        },
        gold: {
          600: '#a67c2e',
          500: '#c6993d',
          100: '#f8f0dc',
        },
      },
      fontFamily: {
        serif: ['"Songti SC"', '"STSong"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
