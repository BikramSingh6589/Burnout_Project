/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#14B8A6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        foreground: "#0F172A",
        "foreground-muted": "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0px 4px 12px rgba(0,0,0,0.08)",
        hover: "0px 8px 24px rgba(0,0,0,0.12)",
      }
    },
  },
  plugins: [],
}
