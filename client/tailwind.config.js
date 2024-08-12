import { nextui } from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'accent': '#581c87',
      'white': '#ffffff',
      'black': '#171717',
      's-white': '#e6e6e6',
      's-black': '#172024',
      's-black-2': '#1f282b',
      'passive': '#888888',
      'message': '#bbf',
      'link': '#08f'
    },
    extend: {
      colors
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#006FEE",
            foreground: "#ffffff",
          },
          bnav: "#338EF7"
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#7828C8",
            foreground: "#ffffff",
          },
          background: '#0f171b',
          content1: '#172024',
          content2: '#1b2730',
          content3: '#213037',
          content4: '#334048',
        },
      },
    },
  })],
}
