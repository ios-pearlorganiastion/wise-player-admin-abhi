/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: '#0B0A0C',
        surface: '#141215',
        surface2: '#1B181B',
        line: 'rgba(255,255,255,0.06)',
        maroon: { DEFAULT: '#991c22', 
         light: '#c0272d', 
         dark: '#4a0c10'  },
        ink: '#F1EDEE',
        subtle: '#9C9498',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
          keyframes: {
        scan: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 40px' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(400%) skewX(-12deg)' },
        },
        bar: {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.5' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
        colorbar: {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '200% 0' },
         },
      },
      animation: {
        scan: 'scan 6s linear infinite',
        sweep: 'sweep 7s ease-in-out infinite',
        bar: 'bar 1.2s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        colorbar: 'colorbar 4s linear infinite'
      },
    },
  },
  plugins: [],
}