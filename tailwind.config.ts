/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'pagination-active-bg': 'var(--color-pagination-active-bg)',
        'pagination-active-text': 'var(--color-pagination-active-text)',
        'pagination-inactive-bg': 'var(--color-pagination-inactive-bg)',
        'pagination-inactive-text': 'var(--color-pagination-inactive-text)',
        outline: 'var(--color-outline)',
      },
      fontFamily: {
        slim: ['slim', 'sans-serif'],
        slimbold: ['slimbold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}