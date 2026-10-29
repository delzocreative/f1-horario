/** @type {import('tailwindcss').Config} */
// Same config that used to live inline in index.html for the Tailwind CDN.
// Scans the HTML and the app JS (classes are also built inside JS template
// strings in src/app.js, e.g. session rows and the country list).
module.exports = {
  content: ['./src/index.html', './src/app.js', './public/404.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: { f1: { red: '#e10600' } }
    }
  }
};
