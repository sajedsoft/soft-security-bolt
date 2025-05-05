/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        security: {
          primary: '#1a56db', // Darker blue for better contrast
          dark: {
            900: '#1f2937', // Darkest - sidebar
            800: '#374151', // Dark - header
            700: '#4b5563', // Card backgrounds
            600: '#6b7280', // Borders
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}