/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0D1117",
          surface: "#161B22",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#8B949E",
          muted: "#484F58",
        },
        border: {
          DEFAULT: "#21262D",
          subtle: "#30363D",
        },
        discipline: {
          emerald: "#10B981",
          blue: "#3B82F6",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
          purple: "#8B5CF6",
          gray: "#6B7280",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animation: {
        "fade-in": "fadeIn 250ms ease-out",
        "scale-in": "scaleIn 250ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
