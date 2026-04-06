/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#04111F',
        navy2:   '#0B2035',
        navy3:   '#0E2A47',
        teal:    '#00C8D4',
        mint:    '#00F0B5',
        orange:  '#FF6535',
        danger:  '#FF3355',
        success: '#22D46A',
      },
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
      },
    },
  },
  plugins: [],
}
