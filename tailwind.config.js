/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-urbanist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        paper: "#F7FAF8",
        ink: "#0D1912",
        moss: {
          50: "#EEF7F1",
          100: "#D9EDE1",
          200: "#B3DBC3",
          300: "#7FC29B",
          400: "#4FA97A",
          500: "#1E8E58",
          600: "#0F7A48",
          700: "#0C5F39",
          800: "#0A4B2E",
          900: "#083A24",
        },
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        gold: {
          400: "#E4BB6B",
          500: "#D9A441",
          600: "#B9852B",
        },
        slate: {
          50: "#F8FAFA",
          100: "#EFF3F1",
          200: "#DCE4E0",
          300: "#BFCCC5",
          400: "#8FA39A",
          500: "#647F73",
          600: "#4B6459",
          700: "#3A4F46",
          800: "#283732",
          900: "#182420",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(13, 25, 18, 0.08)",
        "glass-lg": "0 20px 60px -12px rgba(13, 25, 18, 0.18)",
        "glow-emerald": "0 0 40px -8px rgba(16, 185, 129, 0.45)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(15, 122, 72, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 122, 72, 0.08) 1px, transparent 1px)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
