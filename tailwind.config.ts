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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // CrownVault brand colors
        vault: {
          dark: "#0a0a0f",
          darker: "#06060a",
          card: "#12121a",
          border: "#1e1e2e",
          muted: "#8888a0",
        },
        accent: {
          blue: "#3b82f6",
          "blue-light": "#60a5fa",
          "blue-glow": "#3b82f620",
          pink: "#ec4899",
          "pink-light": "#f472b6",
          "pink-glow": "#ec489920",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-blue": "radial-gradient(ellipse at center, #3b82f615 0%, transparent 70%)",
        "glow-pink": "radial-gradient(ellipse at center, #ec489915 0%, transparent 70%)",
        "glow-mixed": "radial-gradient(ellipse at 30% 50%, #3b82f610 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, #ec489910 0%, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
