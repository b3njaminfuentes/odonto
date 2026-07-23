import type { Config } from "tailwindcss";

/**
 * Sistema de diseño "Salvia & Coral" — Clínica Villarroel.
 * Los tokens son la UNICA fuente de verdad. Los colores apuntan a variables CSS
 * (definidas en globals.css) para que un solo cambio re-tematice todo el sitio y
 * habilite el modo oscuro del panel admin (.dark) sin duplicar clases.
 *
 * Uso: text-brand, bg-surface, border-border, bg-accent-soft, text-muted, etc.
 * El formato `hsl(var(--x) / <alpha-value>)` permite bg-brand/10, text-muted/70…
 */
const withAlpha = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superficies y estructura
        bg: withAlpha("--bg"),
        surface: withAlpha("--surface"),
        elevated: withAlpha("--elevated"),
        border: withAlpha("--border"),
        "border-soft": withAlpha("--border-soft"),

        // Texto
        text: withAlpha("--text"),
        muted: withAlpha("--muted"),
        faint: withAlpha("--faint"),

        // Marca (verde salvia)
        brand: {
          DEFAULT: withAlpha("--brand"),
          hover: withAlpha("--brand-hover"),
          fg: withAlpha("--brand-fg"),
          soft: withAlpha("--brand-soft"),
        },

        // Acento (coral)
        accent: {
          DEFAULT: withAlpha("--accent"),
          hover: withAlpha("--accent-hover"),
          fg: withAlpha("--accent-fg"),
          soft: withAlpha("--accent-soft"),
        },

        // Estados
        success: withAlpha("--success"),
        "success-soft": withAlpha("--success-soft"),
        warning: withAlpha("--warning"),
        "warning-soft": withAlpha("--warning-soft"),
        danger: withAlpha("--danger"),
        "danger-soft": withAlpha("--danger-soft"),
        info: withAlpha("--info"),
        "info-soft": withAlpha("--info-soft"),
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 32, 25, 0.04), 0 8px 24px -6px rgba(16, 32, 25, 0.08)",
        lift: "0 2px 4px rgba(16, 32, 25, 0.05), 0 16px 40px -12px rgba(16, 32, 25, 0.14)",
        glow: "0 0 0 1px hsl(var(--brand) / 0.12), 0 10px 30px -8px hsl(var(--brand) / 0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
