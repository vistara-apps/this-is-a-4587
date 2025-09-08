/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 15%, 95%)',
        accent: 'hsl(170, 70%, 50%)',
        primary: 'hsl(240, 80%, 60%)',
        surface: 'hsl(0, 0%, 100%)',
        crypto: {
          dark: '#1a1b23',
          blue: '#2563eb',
          purple: '#7c3aed',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }
      },
      borderRadius: {
        'lg': '15px',
        'md': '10px',
        'sm': '5px',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.08)',
        'crypto': '0 8px 32px rgba(37, 99, 235, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}