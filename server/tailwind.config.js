/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00', // Laranja Shopee/Pet
        secondary: '#2D3748', // Cinza escuro elegante
      }
    },
  },
  plugins: [],
}