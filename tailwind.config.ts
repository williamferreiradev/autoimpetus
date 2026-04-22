import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Removendo Playfair para algo mais esportivo e corporativo (Inter para tudo)
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#E53935', // Vermelho Forte
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#E53935',
          600: '#D32F2F',
          700: '#C62828',
          glow: '#E5393530'
        },
        dark: {
          bg: '#050505',
          surface: '#111111',
          card: '#181A20',
          border: '#2A2D35',
          text: '#F3F4F6',
          muted: '#9CA3AF'
        },
        accent: {
          DEFAULT: '#FF1744',
        }
      },
      boxShadow: {
        luxury: '0 10px 30px -5px rgba(229, 57, 53, 0.25)', // Sombra Vermelha
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        card: '4px',
      }
    }
  }
}
