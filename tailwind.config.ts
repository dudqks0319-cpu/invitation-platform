import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        "primary-dark": "var(--primary-dark)",
        accent: "var(--accent)",
        "bg-cream": "var(--bg-cream)",
        "bg-light": "var(--bg-light)",
        "text-dark": "var(--text-dark)",
        "text-mid": "var(--text-mid)",
        "text-light": "var(--text-light)",
        border: "var(--border)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-sm)"
      },
      boxShadow: {
        soft: "var(--shadow)",
        hero: "var(--shadow-lg)"
      }
    }
  },
  plugins: []
};

export default config;
