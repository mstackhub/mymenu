/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        soft: "#F8F9FA",
        border: "#E9ECEF",
        primary: {
          50: "#FFF5F5",
          100: "#FFE3E3",
          500: "#FF5A36",
          600: "#E04826",
          700: "#C43617",
          DEFAULT: "#FF5A36",
        },
        dark: {
          primary: "#18181B",
          secondary: "#71717A",
          muted: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["'Sarabun'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Sarabun'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
