/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: '#080B12',
        panel: '#0D1117',
        surface: '#131A24',
        surface2: '#1A2333',
        accent: '#00D4FF',
        accent2: '#7C3AED',
        positive: '#00E5A0',
        negative: '#FF4D6D',
        warning: '#FFB830',
        muted: '#4B5563',
        muted2: '#9CA3AF',
      },
    },
  },
  plugins: [],
}
