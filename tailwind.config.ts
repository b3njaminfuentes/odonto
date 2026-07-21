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
        primary: "#0B3D2E",
        secondary: "#FAF8F3",
        accent: "#C9A44C",
        neutral: "#8C8A85",
        textMain: "#141414",
        surface: "#FFFFFF",
        surfaceHover: "#F9FAFB",
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
        soft: '0 20px 60px rgba(11, 61, 46, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
