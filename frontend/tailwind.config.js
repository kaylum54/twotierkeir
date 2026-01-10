/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GOV.UK Blue - used ironically
        gov: {
          blue: '#1d70b8',
          'blue-dark': '#003078',
          'blue-light': '#5694ca',
        },
        // Disaster/Warning Red
        disaster: {
          DEFAULT: '#d4351c',
          light: '#f47738',
          dark: '#942514',
        },
        // Bureaucratic Paper
        paper: {
          beige: '#f3f2f1',
          white: '#ffffff',
          aged: '#f5f5dc',
          manila: '#f4e4bc',
        },
        // Text
        ink: {
          black: '#0b0c0c',
          grey: '#505a5f',
          light: '#6f777b',
        },
        // Highlights & Stamps
        highlight: {
          yellow: '#ffdd00',
          'tape-yellow': '#ffd000',
        },
        stamp: {
          red: '#8b0000',
          blue: '#003078',
          black: '#0b0c0c',
        },
        // Cork board
        cork: '#c4a574',
        // Terminal green
        terminal: {
          green: '#00ff00',
          dark: '#001100',
        },
      },
      fontFamily: {
        typewriter: ['"Special Elite"', '"Courier New"', 'monospace'],
        handwriting: ['Caveat', 'cursive'],
        stamp: ['Impact', '"Arial Black"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'scroll-left': 'scrollLeft 20s linear infinite',
        'scroll-left-fast': 'scrollLeft 10s linear infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
        'wiggle-once': 'wiggle 0.3s ease-in-out',
        'stamp-drop': 'stampDrop 0.3s ease-out forwards',
        'lift': 'lift 0.2s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scrollLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        stampDrop: {
          '0%': { transform: 'scale(2) rotate(15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(-5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.85' },
        },
        lift: {
          '0%': { transform: 'translateY(0) rotate(0deg)', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' },
          '100%': { transform: 'translateY(-5px) rotate(1deg)', boxShadow: '5px 10px 20px rgba(0,0,0,0.2)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glitch: {
          '0%, 100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
          '20%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-2px, 2px)' },
          '40%': { clipPath: 'inset(40% 0 40% 0)', transform: 'translate(2px, -2px)' },
          '60%': { clipPath: 'inset(60% 0 20% 0)', transform: 'translate(-2px, 0)' },
          '80%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(2px, 2px)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'warning-stripe': 'repeating-linear-gradient(45deg, #000, #000 10px, #ffdd00 10px, #ffdd00 20px)',
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'grid-lines': 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        'paper': '2px 2px 5px rgba(0,0,0,0.1), -1px -1px 3px rgba(255,255,255,0.5)',
        'paper-hover': '5px 10px 20px rgba(0,0,0,0.2)',
        'stamp': 'inset 0 0 0 2px currentColor',
        'inset-dark': 'inset 0 2px 10px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
