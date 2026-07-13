/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {  
      'phone': '300px',
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',    
    },
    container: {
      center: true,
      padding: '1rem',
      // Only snap `.container` to a fixed max-width from tablet up.
      // Without this, the default container plugin uses the same
      // breakpoints as `screens` above, which would clamp the container
      // to a fixed 300px width on every phone wider than 300px (i.e.
      // almost every real phone) — squeezing all page content into a
      // narrow column with big empty margins. Leaving "phone" out here
      // means the container stays fluid (100% + padding) until tablet
      // width, which is what you actually want on mobile.
      screens: {
        tablet: '640px',
        laptop: '1024px',
        desktop: '1280px',
      },
    },
  }, 
  plugins: [
    require('tailwind-scrollbar-hide')
    // ...
  ]
}
