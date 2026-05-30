export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enigma: {
          dark: '#0a0a0f',
          panel: '#111118',
          green: '#00ff41',
          cyan: '#00d4ff',
          amber: '#ffb000',
          red: '#ff0040',
          purple: '#9d4edd',
          muted: '#2a2a3a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
