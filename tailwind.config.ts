import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Your exact color scheme
        primary: '#55CEFD', // Header/footer blue
        secondary: '#F6AAB7', // Pink gradient
        accent: '#042546', // Dark blue text
        error: '#cc5aa2', // Error pink
        success: '#059e82' // Success green
      },
      fontFamily: {
        // Will be defined in globals.css
        slim: ['var(--font-slim)'],
        slimbold: ['var(--font-slimbold)']
      },
      // Subtle animations
      transitionProperty: {
        'border': 'border-color',
        'shadow': 'box-shadow'
      }
    }
  },
  plugins: [
    // Native Tailwind plugins (no extras)
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
}

export default config