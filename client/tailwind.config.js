/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"DM Sans\"", "system-ui", "sans-serif"],
        display: ["\"Syne\"", "system-ui", "sans-serif"],
      },
      colors: {
        stalk: {
          bg: "#0b0f14",
          card: "#121922",
          line: "#1f2a37",
          mint: "#34d399",
          rose: "#fb7185",
          amber: "#fbbf24",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(52, 211, 153, 0.35)",
      },
    },
  },
  plugins: [],
};
