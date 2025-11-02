/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dessert: {
          vanilla: '#f8f4e6',
          chocolate: '#8b4513',
          cherry: '#dc143c',
          lemon: '#ffff99',
          cream: '#fffdd0',
          raspberry: '#e30b5c',
        }
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'open-door': 'openDoor 0.5s ease-out forwards',
        'close-door': 'closeDoor 0.5s ease-out forwards',
      },
      keyframes: {
        openDoor: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(-45deg)' },
        },
        closeDoor: {
          '0%': { transform: 'perspective(1000px) rotateY(-45deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(0deg)' },
        }
      }
    },
  },
  plugins: [],
}