import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0B0D10",
        surface: "#14171C",
        border: "#272B33",
        foreground: "#F4F1EA",
        gold: "#C8A45D",
        success: "#35C486",
        danger: "#E65757",
        muted: "#8F96A3",
        card: "#14171C",
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0, 0, 0, 0.32)",
        glow: "0 0 0 1px rgba(200, 164, 93, 0.18), 0 18px 48px rgba(200, 164, 93, 0.08)",
      },
      borderRadius: {
        app: "18px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
