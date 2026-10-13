import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A3D3A",
          dark: "#062927",
          light: "#125450",
        },
        teal: {
          DEFAULT: "#0B8A7E",
          hover: "#09756b",
          light: "#E1F3F0",
        },
        saffron: {
          DEFAULT: "#F2B01E",
          hover: "#D99B16",
          light: "#FDF5E3",
        },
        mist: "#EEF6F3",
        white: "#FFFFFF",
        "muted-text": "#2F5B57",
        "danger-soft": "#FFE4DF",
        "danger-text": "#B3321F",
      },
      fontFamily: {
        heading: ["var(--font-unbounded)", "sans-serif"],
        sans: ["var(--font-onest)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
