import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── New brand palette ──────────────────────────────────────────
        primary: {
          50:  "#EBF0FF",
          100: "#C7D6FF",
          200: "#95B0FF",
          300: "#6388FF",
          400: "#4F79FF",
          500: "#1B4FDB",
          600: "#1340B5",
          700: "#0F3190",
          800: "#0A2368",
          900: "#061445",
          950: "#030A28",
        },
        accent: {
          50:  "#FFF0EB",
          100: "#FFD9C7",
          200: "#FFB399",
          300: "#FF8C6B",
          400: "#FF6B35",
          500: "#E85A22",
          600: "#C44A18",
          700: "#A03A10",
          800: "#7A2B09",
          900: "#541C04",
        },
        // ── Keep existing for backward-compat (admin, etc.) ────────────
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
        display: ['"Tajawal"', '"Cairo"', "sans-serif"],
        sans:    ['"Cairo"', '"Tajawal"', '"Readex Pro"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:      "0 2px 12px rgba(10,19,32,0.06)",
        cardHover: "0 8px 24px rgba(10,19,32,0.10)",
        primary:   "0 8px 24px rgba(27,79,219,0.25)",
        accent:    "0 8px 24px rgba(255,107,53,0.30)",
      },
      borderRadius: { xl2: "1rem" },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%":       { transform: "translateY(-22px) scale(1.03)" },
        },
        floatB: {
          "0%, 100%": { transform: "translateY(0px) scale(1) rotate(0deg)" },
          "50%":       { transform: "translateY(-14px) scale(1.01) rotate(3deg)" },
        },
        fadeSlideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,107,53,0.4)" },
          "50%":       { boxShadow: "0 0 22px 6px rgba(255,107,53,0.16)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float:         "float 8s ease-in-out infinite alternate",
        "float-delay": "floatB 11s ease-in-out 2.5s infinite alternate",
        "float-slow":  "floatB 13s ease-in-out 5s infinite alternate",
        fadeSlideUp:   "fadeSlideUp 0.5s ease-out forwards",
        pulseGlow:     "pulseGlow 2.5s infinite",
        shimmer:       "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
