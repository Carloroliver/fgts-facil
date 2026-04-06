/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00C16A',
          'green-dark': '#009950',
          dark: '#0A1628',
          dark2: '#162035',
          dark3: '#1a2744',
        },
      },
    },
  },
  plugins: [],
};
