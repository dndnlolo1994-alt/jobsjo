import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#f1f4f9",
          100: "#dce4ee",
          200: "#b5c5d9",
          300: "#7d97b8",
          400: "#506e93",
          500: "#324c70",
          600: "#243a57",
          700: "#1a2c43",
          800: "#121f30",
          900: "#0a1320",
          950: "#060c17",
        },
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        sand: {
          50:  "#fbf8f1",
          100: "#f4ebd6",
          200: "#e9d3a3",
          300: "#dab86d",
          400: "#caa248",
          500: "#b78a30",
          600: "#9a7026",
          700: "#7a5621",
          800: "#5b4019",
          900: "#3b2810",
        },
      },
      fontFamily: {
        sans: ['"Readex Pro"', '"Cairo"', '"Tajawal"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(10, 19, 32, 0.06)",
        cardHover: "0 8px 24px rgba(10, 19, 32, 0.10)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
