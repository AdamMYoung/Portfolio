const sharedConfig = require("tailwind-config/tailwind.config.js");
const merge = require("lodash.merge");
const { fontFamily } = require("tailwindcss/defaultTheme");

const config = { ...sharedConfig };

merge(config, {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jost)", ...fontFamily.sans],
      },
    },
  },
});

/** @type {import('tailwindcss').Config} */
module.exports = config;
