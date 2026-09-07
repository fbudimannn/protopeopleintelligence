import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#23C9D3",
          yellow: "#FFED00",
          navy: "#1D3557",
        },
        ink: {
          primary: "#111111",
          secondary: "#5F6B6D",
          muted: "#8C9B9D",
        },
        surface: {
          white: "#FFFFFF",
          soft: "#F6FAFA",
          card: "#FFFFFF",
          mint: "#B2D9D0",
          warm: "#E9E7DB",
        },
        border: {
          default: "#DDE5E6",
          active: "#23C9D3",
        },
        status: {
          healthy: "#2E8B57",
          attention: "#C99400",
          critical: "#C65353",
          info: "#2585A6",
        }
      },
      fontFamily: {
        spartan: ["var(--font-spartan)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        feature: "20px",
      },
      boxShadow: {
        card: "0 6px 24px rgba(17, 17, 17, 0.06)",
        dropdown: "0 10px 30px rgba(17, 17, 17, 0.12)",
      }
    },
  },
  plugins: [],
};

export default config;
