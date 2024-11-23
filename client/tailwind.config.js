/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      color: {
        "background-color": "var(--background)",
        "primary-color": "var(--primary)",
        "primary-variant-color": "var(--primary-variant])",
        "error-color": "var(--error)",
        "surface-color": "var(--surface)",
        "inset-color": "var(--inset)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-error": "var(--text-error)",
        "text-background": "var(--text-background)",
      },
    },
  },
  plugins: [],
};
