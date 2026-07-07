/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        steel: "#56657a",
        circuit: "#0f766e",
        signal: "#f59e0b",
        panel: "#f7f9fc"
      }
    }
  },
  plugins: []
};
