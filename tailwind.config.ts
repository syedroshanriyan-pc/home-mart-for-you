import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF9F5",
          100: "#F4F0E8",
          200: "#E9E2D5",
          300: "#DDD4C1",
          400: "#C6B99E",
          500: "#AE9E7D",
        },
        charcoal: {
          50: "#706E6B",
          100: "#504E4B",
          200: "#3D3B39",
          300: "#2B2A28",
          400: "#201F1E",
          500: "#161514",
          600: "#100F0E",
          700: "#0A0A09",
        },
        amberGold: {
          50: "#FEF9EE",
          100: "#FDF0D2",
          200: "#FBDFA4",
          300: "#F7C96B",
          400: "#EFA927",
          500: "#CB810E",
          600: "#A76008",
        },
        copper: {
          50: "#FDF5F2",
          100: "#FAE7E0",
          200: "#F4CEBF",
          300: "#EAA68E",
          400: "#DC7453",
          500: "#BD4E2B",
          600: "#983616",
        },
        sage: {
          50: "#F4F6F4",
          100: "#E5EBE6",
          200: "#CDD8CE",
          300: "#A6BAA9",
          400: "#79967D",
          500: "#4D6B52",
          600: "#344B38",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(22, 21, 20, 0.05), 0 1px 2px 0 rgba(22, 21, 20, 0.03)",
        card: "0 4px 20px -2px rgba(22, 21, 20, 0.06)",
        float: "0 12px 32px -4px rgba(22, 21, 20, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
