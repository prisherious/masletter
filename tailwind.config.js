/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#F5F1EF",
          100: "#EAE2DE",
          200: "#DACBC1",
          600: "#684D49",   // dein Keramik-Braun
          700: "#553F3B",
        }
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" }
    },
  },
  plugins: [],
};
