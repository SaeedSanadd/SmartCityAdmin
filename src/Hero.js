// hero.js
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#2e7d32",
          600: "#1b5e20",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#2e7d32",
          foreground: "#ffffff",
        },
        focus: "#2e7d32",
      },
    },
    dark: {
      colors: {
        primary: {
          50: "#14532d",
          100: "#166534",
          200: "#15803d",
          300: "#16a34a",
          400: "#2e7d32",
          500: "#2e7d32",
          DEFAULT: "#2e7d32",
          foreground: "#ffffff",
        },
        focus: "#2e7d32",
      },
    },
  },
});