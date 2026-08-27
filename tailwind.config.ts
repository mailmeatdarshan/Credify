import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F4ECE0',
          300: '#EAE0CE',
          400: '#D5C5AC',
          500: '#B8A487',
          600: '#948065',
          700: '#716049',
          800: '#4F4232',
          900: '#2E261C',
          950: '#17130D',
        },
        butter: {
          50: '#FFFDF5',
          100: '#FFF9E5',
          200: '#FEF0C2',
          300: '#FDE495',
          400: '#FCD462',
          500: '#FBC02D',
          600: '#E5A614',
          700: '#B87F08',
          800: '#8A5D08',
          900: '#5C3D06',
        },
        obsidian: {
          50: '#F6F6F7',
          100: '#E1E2E4',
          200: '#C2C4C9',
          300: '#9CA0A9',
          400: '#6D727E',
          500: '#4B505B',
          600: '#363A43',
          700: '#272A31',
          800: '#1C1E23',
          900: '#141619',
          950: '#0C0D0F',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(30, 25, 20, 0.05)',
        'warm': '0 4px 12px rgba(30, 25, 20, 0.06)',
        'warm-md': '0 8px 24px rgba(30, 25, 20, 0.08)',
        'warm-lg': '0 16px 36px rgba(30, 25, 20, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;

