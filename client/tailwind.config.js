/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        zinc: {
          750: '#2a2a2e',
          850: '#1a1a1e',
          950: '#0a0a0f'
        },
        kite: {
          orange: '#f35936',
          blue: '#4184f3',
          red: '#df514c',
          green: '#2ebd85',
          dark: '#191919',
          card: '#222222',
          border: '#2d2d2d'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
}
