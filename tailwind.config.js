/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#5C5CB7",
          200: "#3D3DAA",
          300: "#1F1F9C",
          400: "#00008F",
          500: "#00006D",
          600: "#010143"
        },
        secondary: {
          100: "#E28972",
          200: "#DD7358",
          300: "#D75D3D",
          400: "#D24723",
          500: "#B03C1D",
          600: "#8A290E"
        },
        gray: {
          "footer": "#c7c7c7",
          100: "#FAFAFA",
          200: "#F0F0F0",
          300: "#E5E5E5",
          400: "#CCCCCC",
          500: "#999999",
          600: "#757575",
          700: "#757575",
          800: "#343C3D",
          900: "#111B1D"
        },
        success: "#138636",
        warning: "#FFBC11",
        danger: "#C91432",
        info: "#4976BA",
        font: "#F0F0F0"
      }
    },
    fontFamily: {
      sans: ['Source Sans Pro', 'sans-serif']
    }
  },
  content: [
    './src/**/*.{html,ts}',
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('preline/plugin'),
  ],
}
