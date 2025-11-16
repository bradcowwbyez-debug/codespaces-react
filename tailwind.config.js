export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        twitter: {
          50: '#f7f9fa',
          100: '#eff3f5',
          200: '#e1e8ed',
          300: '#cdd9e1',
          400: '#657786',
          500: '#657786',
          600: '#1da1f2',
          700: '#1a91da',
          800: '#1b45a0',
          900: '#0f1419',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
      },
      spacing: {
        18: '4.5rem'
      }
      ,
      transitionDuration: {
        '250': '250ms'
      }
    }
  },
    darkMode: 'class',
  plugins: []
}
