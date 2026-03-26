export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0908",
          900: "#14120f",
          800: "#1e1b16",
          700: "#2d2820",
        },
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        gold: {
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
        },
        stone: {
          50: "#faf9f7",
          100: "#f3f0ea",
          200: "#e8e2d6",
          300: "#d4c9b5",
        },
        emerald: {
          400: "#4ade80",
          500: "#22c55e",
        },
        ruby: {
          400: "#f87171",
          500: "#ef4444",
        },
        sapphire: {
          400: "#60a5fa",
          500: "#3b82f6",
        },
      },
      backgroundImage: {
        "silk-texture":
          "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(212,168,67,0.03) 2px, rgba(212,168,67,0.03) 4px)",
      },
    },
  },
  plugins: [],
};