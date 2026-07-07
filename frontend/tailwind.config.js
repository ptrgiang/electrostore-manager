/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        navy: "#0b1220",
        steel: "#64748b",
        circuit: "#0f766e",
        signal: "#f59e0b",
        panel: "#f6f8fb",
        line: "#e2e8f0"
      }
    }
  },
  plugins: []
};
