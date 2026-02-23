/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--background))',
                foreground: 'rgb(var(--foreground))',
                // DISPATCH Industrial Palette
                industrial: {
                    dark: '#0D0E12',
                    muted: '#2A2B30',
                    border: '#323238',
                },
                amber: {
                    warning: '#F5A623',
                },
                cyan: {
                    active: '#00FFD1',
                },
                critical: '#FF2D55',
                card: {
                    DEFAULT: 'rgb(var(--card))',
                    foreground: 'rgb(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'rgb(var(--popover))',
                    foreground: 'rgb(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'rgb(var(--primary))',
                    foreground: 'rgb(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--secondary))',
                    foreground: 'rgb(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted))',
                    foreground: 'rgb(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'rgb(var(--accent))',
                    foreground: 'rgb(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'rgb(var(--destructive))',
                    foreground: 'rgb(var(--destructive-foreground))',
                },
                border: 'rgb(var(--border))',
                input: 'rgb(var(--input))',
                ring: 'rgb(var(--ring))',
                // Keep brand for legacy compatibility but deprecate in favor of industrial
                brand: {
                    500: '#0ea5e9',
                },
            },
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-ibm-plex-mono)', 'monospace'],
                industrial: ['var(--font-archivo-black)', 'sans-serif'],
                condensed: ['var(--font-barlow-condensed)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease both',
                'slide-up': 'slideUp 0.3s ease both',
                'pulse-warn': 'pulseWarn 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scanline': 'scanline 8s linear infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                pulseWarn: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
                scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
