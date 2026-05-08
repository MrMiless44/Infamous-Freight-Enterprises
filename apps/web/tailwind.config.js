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
          orange: '#f05a24',
          'orange-light': '#ff8a3d',
          'orange-dark': '#b83a14',
          ember: '#ffb45f',
          ink: '#11100f',
          dark: '#11100f',
          darker: '#070706',
          card: '#191714',
          panel: '#23201b',
          border: '#342f28',
          'border-light': '#4a4237',
          steel: '#8fa3ad',
          cream: '#f6efe4',
          success: '#3fbf7f',
          warning: '#e8a23b',
          danger: '#e05a47',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Archivo Black', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
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
      },
    },
  },
  plugins: [],
};
