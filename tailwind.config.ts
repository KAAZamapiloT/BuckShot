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
        paper: "#FAF4E6",
        panel: "#FFFDF7",
        ink: "#121218",
        crimson: "#FF3358",
        cyan: {
          ki: "#00C2FF",
        },
        gold: "#FFC82C",
        violet: {
          spirit: "#7C4DFF",
        },
        emerald: {
          chakra: "#00C875",
        },
        sakura: "#FF6FAE",
      },
      fontFamily: {
        manga: ["var(--font-bangers)", "Impact", "sans-serif"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        ink: "5px 5px 0px #121218",
        "ink-sm": "3px 3px 0px #121218",
        "ink-lg": "8px 8px 0px #121218",
        "ink-crimson": "5px 5px 0px #FF3358",
        "ink-cyan": "5px 5px 0px #00C2FF",
      },
    },
  },
  plugins: [],
};

export default config;
