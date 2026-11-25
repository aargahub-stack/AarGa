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
        mono: ["var(--font-urbanist)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Strict 3-color palette
        paper: "#F7F8FA",
        ink: "#0C0D0E",
        accent: "#00F076",
        primary: "#00F076",

        // Map system tokens cleanly to the 3-color palette
        moss: {
          50: "#F7F8FA",
          100: "rgba(16, 154, 112, 0.08)",
          200: "rgba(16, 154, 112, 0.16)",
          300: "#109A70",
          400: "#109A70",
          500: "#109A70",
          600: "#109A70",
          700: "#0C0D0E",
          800: "#0C0D0E",
          900: "#0C0D0E",
        },
        emerald: {
          50: "#F7F8FA",
          100: "rgba(16, 154, 112, 0.08)",
          200: "rgba(16, 154, 112, 0.16)",
          300: "#109A70",
          400: "#109A70",
          500: "#109A70",
          600: "#109A70",
          700: "#109A70",
          800: "#0C0D0E",
          900: "#0C0D0E",
        },
        gold: {
          400: "#00F076",
          500: "#00F076",
          600: "#00F076",
        },
        slate: {
          50: "#F7F8FA",
          100: "rgba(12, 13, 14, 0.04)",
          200: "rgba(12, 13, 14, 0.08)",
          300: "rgba(12, 13, 14, 0.16)",
          400: "rgba(12, 13, 14, 0.45)",
          500: "rgba(12, 13, 14, 0.60)",
          600: "rgba(12, 13, 14, 0.75)",
          700: "#0C0D0E",
          800: "#0C0D0E",
          900: "#0C0D0E",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(12, 13, 14, 0.06)",
        "glass-lg": "0 20px 60px -12px rgba(12, 13, 14, 0.12)",
        "glow-emerald": "0 0 40px -8px rgba(0, 240, 118, 0.45)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0, 240, 118, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 118, 0.08) 1px, transparent 1px)",
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
