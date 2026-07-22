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
        primary: "#0B3D2E", // Keep for text contrast where needed
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
        
        // Neo-Brutalism Palette
        neoYellow: "#FFD426",
        neoPink: "#FF69B4",
        neoGreen: "#5FF35F",
        neoPurple: "#9D74FF",
        neoBlue: "#4169E1",
        neoBg: "#FDFDFD",
        neoBorder: "#000000",
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
        neo: '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
export default config;
