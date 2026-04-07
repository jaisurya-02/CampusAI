/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(120, 140, 255, 0.18), 0 0 30px rgba(65, 105, 255, 0.25), 0 16px 45px rgba(18, 23, 55, 0.5)',
        card: '0 20px 45px rgba(5, 8, 22, 0.45)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-18px) translateX(14px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(136, 153, 255, 0.25), 0 0 24px rgba(106, 99, 255, 0.28)' },
          '50%': { boxShadow: '0 0 0 1px rgba(136, 153, 255, 0.4), 0 0 36px rgba(106, 99, 255, 0.55)' },
        },
      },
      animation: {
        drift: 'drift 9s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

