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
        ink: "#0f172a",
        mist: "#f8fafc",
        sky: "#dbeafe",
        pine: "#14532d",
        ember: "#9f1239",
        sand: "#fef3c7",
        line: "#cbd5e1"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
