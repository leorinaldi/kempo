import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wikipedia-inspired colors
        'wiki-blue': '#3366cc',
        'wiki-link': '#0645ad',
        'wiki-visited': '#0b0080',
        'wiki-border': '#a2a9b1',
        'wiki-background': '#f8f9fa',
        'wiki-infobox': '#f8f9fa',
        'wiki-infobox-header': '#cedff2',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
