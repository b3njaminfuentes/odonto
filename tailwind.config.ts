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
        primary: "#0D9488", // Teal 600 - Clinical Warm
        primaryHover: "#0F766E", // Teal 700
        secondary: "#F8FAFC", // Slate 50
        accent: "#14B8A6", // Teal 500
        neutral: "#64748B", // Slate 500
        textMain: "#0F172A", // Slate 900
        surface: "#FFFFFF",
        surfaceHover: "#F1F5F9", // Slate 100
        success: "#10B981",
        successLight: "#D1FAE5",
        warning: "#F59E0B",
        warningLight: "#FEF3C7",
        danger: "#EF4444",
        dangerLight: "#FEE2E2",
        info: "#3B82F6",
        infoLight: "#DBEAFE",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)"],
        sans: ["var(--font-inter)"],
      },
      spacing: {
        // Base 8 spacing is default in Tailwind, just ensuring we stick to it
        '128': '32rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(13, 148, 136, 0.05)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
export default config;
