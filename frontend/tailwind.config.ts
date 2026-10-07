import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* ── SkillSwap brand scale (blue) ── */
        brand: {
          50: "#eef2ff",
          100: "#dde6ff",
          200: "#c3d1fe",
          300: "#9ab0fd",
          400: "#6b87f9",
          500: "#3b65f1",
          600: "#2347e0",
          700: "#1a37be",
          800: "#1730a2",
          900: "#182e85",
        },
        /* ── Semantic tokens (RGB-channel for opacity modifiers) ── */
        surface: "rgb(var(--ss-surface) / <alpha-value>)",
        sunken: "rgb(var(--ss-sunken) / <alpha-value>)",
        ink: "rgb(var(--ss-ink) / <alpha-value>)",
        ink2: "rgb(var(--ss-ink2) / <alpha-value>)",
        ink3: "rgb(var(--ss-ink3) / <alpha-value>)",
        line: "rgb(var(--ss-line) / <alpha-value>)",
        line2: "rgb(var(--ss-line2) / <alpha-value>)",
        /* ── shadcn compat ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 4px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.03)",
        pop: "0 4px 20px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)",
      },
      keyframes: {
        fadein: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        fadein: "fadein 0.25s ease both",
        pulseDot: "pulseDot 1.5s ease infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
