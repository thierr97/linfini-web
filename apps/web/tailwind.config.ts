import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        noir: '#080808', charbon: '#111111', braise: '#C84B1F',
        ambre: '#E8823A', or: '#D4A853', creme: '#F5EDD8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,75,31,0.2)' },
          '50%': { boxShadow: '0 0 50px rgba(200,75,31,0.5)' }
        }
      }
    }
  },
  plugins: []
}
export default config
