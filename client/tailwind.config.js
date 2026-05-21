/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        deva: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
