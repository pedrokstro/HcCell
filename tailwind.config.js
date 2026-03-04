/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F0FDFF',
                    100: '#E0F8FF',
                    200: '#B8F0FF',
                    300: '#7ADFFF',
                    400: '#33D5FF',
                    DEFAULT: '#00CCFF', // Seu ciano original
                    600: '#00A3CC',
                    700: '#007A99',
                    800: '#005166',
                    900: '#002933',
                    dark: '#00A3CC',
                    light: '#E6FAFF',
                },
                background: {
                    light: '#F8FAFC', // Slate 50 - Mais limpo
                    dark: '#020617',  // Slate 950 - Profundo
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#0F172A',  // Slate 900
                },
                slate: {
                    950: '#020617',
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 204, 255, 0.1)',
                'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                'primary-glow': '0 0 15px rgba(0, 204, 255, 0.3)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'fade-in-down': 'fadeInDown 0.5s ease-out',
                'zoom-in': 'zoomIn 0.3s ease-out',
                'spin-slow': 'spinSlow 8s linear infinite',
                'spin-slow-reverse': 'spinSlowReverse 6s linear infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                zoomIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                spinSlow: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                spinSlowReverse: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(-360deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
        },
    },
    plugins: [],
}
