const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx,md,mdx}", "../portfolio-shared/src/**/*.{ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto-mono)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
