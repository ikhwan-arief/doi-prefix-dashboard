/**
 * DOI Prefix Publication Dashboard - Tailwind CSS Configuration
 * Creator: Ikhwan Arief (ikhwan[at]unand.ac.id)
 */

import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        seline: {
          blue: "#3ba6f1",
          wash: "#c1e1f7",
          cream: "#fafaf9",
          white: "#ffffff",
          ink: "#0c0a09",
          charcoal: "#1c1917",
          slate: "#78716c",
          "soft-slate": "#a8a29e",
          "mist-gray": "#afafae",
          "pearl-border": "#e5e7eb",
          "warm-border": "#d6d3d1",
          "fog-border": "#e1dfdd",
          "heading-mute": "#c9c5c2",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Geist", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        "seline-tags": "9999px",
        "seline-cards": "10px",
        "seline-inputs": "4px",
        "seline-buttons": "9999px",
      },
      boxShadow: {
        "seline-md": "rgba(0, 0, 0, 0.05) 0px 4px 16px 0px",
        "seline-sm": "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px",
        "seline-subtle": "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
        "seline-xl": "rgba(17, 12, 46, 0.12) 0px 12px 45px 0px",
      },
    },
  },
  plugins: [],
} satisfies Config;
