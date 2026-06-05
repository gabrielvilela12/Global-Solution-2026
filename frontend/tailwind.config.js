/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#070f1f',
        bg2:     '#0a1730',
        panel:   '#0e1d3a',
        panel2:  '#16294b',
        line:    '#26405f',
        line2:   '#32517a',
        accent:  '#5b8def',
        ink:     '#04222b',
        text:    '#dde6f6',
        muted:   '#9fb1d2',
        dim:     '#728aae',
        warn:    '#e6a559',
        ok:      '#42c9d6',
        info:    '#6f9be6',
        done:    '#5fc08f',
        stop:    '#d97a7a',
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      maxWidth: {
        page: '1180px',
      },
    },
  },
  plugins: [],
}
