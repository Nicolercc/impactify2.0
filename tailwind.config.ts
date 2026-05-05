import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        section: "6rem",
        block: "3rem",
        content: "1.5rem",
        nav: "4.5rem",
      },
      maxWidth: {
        prose: "38rem",
        content: "72rem",
        wide: "84rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        prose: ["var(--font-cormorant)", "Georgia", "serif"],
        ui: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        caption: ["0.8125rem", { lineHeight: "1.25rem" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-lg": ["1.125rem", { lineHeight: "1.65" }],
        lead: ["1.25rem", { lineHeight: "1.55" }],
        title: ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        heading: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["4rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        hero: ["5.5rem", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-xl": ["5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "body-md": ["1.125rem", { lineHeight: "1.6" }],
        "body-sm": ["1rem", { lineHeight: "1.6" }],
        overline: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.05em" }],
      },
      colors: {
        plum: {
          50: "var(--plum-50)",
          100: "var(--plum-100)",
          300: "var(--plum-300)",
          500: "var(--plum-500)",
          700: "var(--plum-700)",
          900: "var(--plum-900)",
        },
        cause: {
          housing: "var(--cause-housing)",
          climate: "var(--cause-climate)",
          democracy: "var(--cause-democracy)",
          health: "var(--cause-health)",
          labor: "var(--cause-labor)",
        },
        chartreuse: {
          100: "var(--chartreuse-100)",
          300: "var(--chartreuse-300)",
          500: "var(--chartreuse-500)",
          700: "var(--chartreuse-700)",
        },
        peach: {
          200: "var(--peach-200)",
          400: "var(--peach-400)",
          600: "var(--peach-600)",
        },
        sage: {
          400: "var(--sage-400)",
          600: "var(--sage-600)",
        },
        parchment: "var(--parchment)",
        "parchment-100": "var(--parchment-100)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
        "spring-gentle": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        default: "200ms",
        page: "400ms",
      },
      keyframes: {
        "chevron-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        typing: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "chevron-bounce": "chevron-bounce 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        typing: "typing 2s steps(40, end) forwards",
      },
    },
  },
  plugins: [typography],
};

export default config;
