/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#FDC800',
        secondary: '#432DD7',
        surface:   '#FBFBF9',
        ink:       '#1C293C',
        danger:    '#DC2626',
        success:   '#16A34A',
      },
      fontFamily: {
        sans:    ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        neo:     '4px 4px 0px 0px #1C293C',
        'neo-lg':'6px 6px 0px 0px #1C293C',
        'neo-sm':'2px 2px 0px 0px #1C293C',
        'neo-xl':'8px 8px 0px 0px #1C293C',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
