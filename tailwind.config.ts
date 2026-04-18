import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(0.12 0.01 255)",
        surface: "oklch(0.16 0.02 255)",
        "surface-highlight": "oklch(0.20 0.02 255)",
        border: "oklch(0.30 0.02 255)",
        foreground: "oklch(0.92 0.01 255)",
        "foreground-muted": "oklch(0.65 0.01 255)",
        primary: "oklch(0.75 0.07 75)",
        "primary-hover": "oklch(0.72 0.07 75)",
        success: "oklch(0.70 0.08 160)",
        warning: "oklch(0.72 0.10 75)",
        muted: "oklch(0.50 0.01 255)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Aleo", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "space-xs": "0.25rem",    // 4px
        "space-sm": "0.5rem",     // 8px
        "space-md": "1rem",       // 16px
        "space-lg": "1.5rem",     // 24px
        "space-xl": "2rem",       // 32px
        "space-2xl": "3rem",      // 48px
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out-quint forwards",
        "slide-up": "slide-up 300ms ease-out-quint forwards",
      },
    },
  },
  plugins: [],
};
export default config;
