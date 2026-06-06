/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        // Keep neutral slate for specific overrides if needed
        neutral: {
          slate: '#131B2E',
          outline: '#767587',
          variant: '#C7C4D8',
        },
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Hanken Grotesk', 'sans-serif'],
        label: ['Geist', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem', // Small (4px)
        DEFAULT: '0.5rem', // Default (8px)
        md: '0.75rem', // Medium (12px)
        lg: '1rem', // Large (16px)
        xl: '1.5rem', // Extra Large (24px)
      },
      boxShadow: {
        card: '0 4px 20px rgba(93, 92, 255, 0.08)',
        level2: '0 10px 25px -5px rgba(93, 92, 255, 0.12), 0 8px 10px -6px rgba(93, 92, 255, 0.12)',
      }
    },
  },
  plugins: [],
}
