// tailwind.config.js
module.exports = {
  darkMode: "class", // Or 'media' if you prefer system preference
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("flowbite/plugin")],
}
