
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // "./node_modules/flowbite/**/*.js",// Tailwind will scan these files
    "./node_modules/tailwind-datepicker-react/dist/**/*.js", 
    "./**/*.html",

  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [
  ]
}
