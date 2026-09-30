import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-contrast': 'var(--accent-contrast)',
        focus: 'var(--focus)',
        'viz-idle': 'var(--viz-idle)',
        'viz-active': 'var(--viz-active)',
        'viz-pointer-a': 'var(--viz-pointer-a)',
        'viz-pointer-b': 'var(--viz-pointer-b)',
        'viz-pointer-c': 'var(--viz-pointer-c)',
        'viz-window': 'var(--viz-window)',
        'viz-visited': 'var(--viz-visited)',
        'viz-success': 'var(--viz-success)',
        'viz-danger': 'var(--viz-danger)',
        'viz-muted': 'var(--viz-muted)',
      }
    },
  },
  plugins: [],
} satisfies Config
