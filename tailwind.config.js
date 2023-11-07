/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sf-pro)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        grow: "grow 0.3s ease-out",
        appear: "appear 0.3s ease-out forwards",
      },
      keyframes: {
        grow: {
          "0%": { transform: "scale(0.5)" },
          "100%": { transform: "scale(1)" },
        },
        appear: {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      colors: {
        primary: "#2B2B2B",
        secondary: "accent",
        background: "#f6f1e9",
        "third-color": "#202020",
        "fourth-color": "#343434",
        "the-gray": "#5e5e5e",
        "our-black": "#0e0e0e",
        "main-text-color": "text-primary",
      },
      screens: {
        xs: "389px",
        xxs: "350px",
      },
    },
  },
  plugins: [
    require("prettier-plugin-tailwindcss"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
};
