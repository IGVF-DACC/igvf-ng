import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        panel: "var(--color-panel-background)",
      },
      borderColor: {
        panel: "var(--color-panel-border)",
      },
      gridTemplateColumns: {
        "min-2": "repeat(2, minmax(0, min-content))",
        "data-item": "fit-content(200px) 1fr",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
export default config;
