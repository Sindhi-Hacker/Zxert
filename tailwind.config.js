/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        'canvas-2': 'var(--color-canvas-2)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        'ink-3': 'var(--color-ink-3)',
        line: 'var(--color-line)',
        'line-2': 'var(--color-line-2)',
        accent: 'var(--color-accent)',
        'accent-ink': 'var(--color-accent-ink)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-line': 'var(--color-accent-line)',
        btn: 'var(--color-btn)',
        'btn-ink': 'var(--color-btn-ink)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        'danger-ink': 'var(--color-danger-ink)',
        bubble: 'var(--color-bubble)',
        'bubble-ink': 'var(--color-bubble-ink)',
        header: 'var(--color-header)',
        glass: 'var(--color-glass)',
        veil: 'var(--color-veil)',
        'glow-1': 'var(--color-glow-1)',
        'glow-2': 'var(--color-glow-2)',
        'glow-3': 'var(--color-glow-3)',
      },
      fontFamily: {
        // Space Grotesk carries the brand voice on display type; body text
        // uses the platform system font for native feel and reliability.
        display: ['SpaceGrotesk', 'system-ui'],
        'display-bold': ['SpaceGrotesk-Bold', 'system-ui'],
      },
      boxShadow: {
        card: '0px 1px 2px rgba(26, 36, 15, 0.07), 0px 4px 14px rgba(26, 36, 15, 0.05)',
        lifted: '0px 2px 6px rgba(26, 36, 15, 0.09), 0px 12px 32px rgba(26, 36, 15, 0.10)',
        float: '0px 8px 30px rgba(26, 36, 15, 0.16)',
        'glow-accent': '0px 0px 22px rgba(155, 225, 93, 0.38)',
        'dark-card': '0px 1px 2px rgba(0, 0, 0, 0.35), 0px 6px 20px rgba(0, 0, 0, 0.35)',
        'dark-float': '0px 10px 34px rgba(0, 0, 0, 0.55)',
      },
    },
  },
  plugins: [],
};
