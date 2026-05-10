/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        infamous: {
          red: '#FF1A1A',
          'red-light': '#FF3B30',
          'red-dark': '#7A0C12',
          ember: '#D62828',
          glow: '#FF3B30',
          dark: '#080204',
          darker: '#160608',
          card: '#241013',
          panel: '#1a0a0d',
          border: '#3A0D12',
          'border-light': '#5a1a22',
          muted: '#B88989',
          navy: '#120507',
          'navy-light': '#1a080b',
          green: '#36D399',
          'green-light': '#36D399',
          orange: '#FF8A00',
          'orange-light': '#FFa033',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Rajdhani', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'glow': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(255, 26, 26, 0.45)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 26, 26, 0.65)' },
        },
      },
    },
  },
  plugins: [],
};
