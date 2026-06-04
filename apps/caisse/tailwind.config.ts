import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        noir: '#080808',
        charbon: '#111111',
        braise: '#C84B1F',
        ambre: '#E8823A',
        or: '#D4A853',
        creme: '#F5EDD8',
      },
    }
  },
  plugins: []
}
export default config
