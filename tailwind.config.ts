/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-jost)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        cream: "#F5F0E8",
        sand: "#E8DDD0",
        warm: "#D4C4B0",
        champagne: "#C9A96E",
        bronze: "#A07850",
        espresso: "#2C1810",
        bark: "#4A3728",
        fog: "#8B7D6B",
        sage: "#7A8C72",
        dusty: "#9B8A9E",
      },
    },
  },
  plugins: [],
};
