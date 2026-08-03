import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette volontairement minimale : un fond, une encre, un accent.
        ivory: "#FBFAF7",
        paper: "#FFFFFF",
        ink: "#12110F",
        muted: "#5C574E",
        rule: "#E2DED4",
        bronze: {
          DEFAULT: "#8A6A34",
          deep: "#6F5429",
        },
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      letterSpacing: {
        label: "0.16em",
      },
    },
  },
  plugins: [],
};

export default config;
