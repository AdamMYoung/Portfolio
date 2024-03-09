const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx,md,mdx}",
    "../../packages/components/src/**/*.{ts,tsx,md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-baskerville)", ...fontFamily.sans],
      },
      animation: {
        blink: "flash 1.5s linear infinite",
      },
      keyframes: {
        flash: {
          "0%": { opacity: "0%" },
          "2%, 50%": { opacity: "100%" },
          "52%, 100%": { opacity: "0%" },
        },
      },
    },
  },
  plugins: [],
};
