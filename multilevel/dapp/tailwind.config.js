/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      fontFamily:{
        'poppins': 'var(--font-poppins)',
        'dm-sans': 'var(--font-dm-sans)',
      },

      colors:{
        "pink10": "#FBE3FF1A",
        "magenta1": "#D107FB",
        "magenta2": "#AD00CC",
        "magenta3": "#9002A6",
        "black1": "#1B1B1E", 
        "black2": "#34343A", 
        "black3": "#23262F", 
        "black4": "#101012", 
        "black5": "#080809", 
        "gray1": "#777E90", 
        "gray2": "#E6E8EC", 
        "gray3": "#B1B5C3", 
        "gray4": "#38383E", 
        "gray5": "#FCFCFD", 
        "purple1": "#09051C", 
        "green1": "#58BD7D", 
        "green2": "#265D3A", 
        "blue1": "#3772FF", 
        "pink1": "#E647FF", 
      },
      backgroundImage:{
        "nav-active": "radial-gradient(50% 50% at 50% 50%, #FFFFFF 12.4%, rgba(255, 255, 255, 0) 95.9%)",
        "xl-gradient": "linear-gradient(0deg, #080809 20%, rgba(21, 3, 12, 0) 100%)",
        "xxl-gradient": "radial-gradient(50% 50% at 50% 50%, #D107FB 0%, rgba(16, 16, 18, 0) 100%)",
      },
      backgroundSize: {
        'full': '100% 100%',
        'full-3': '105% 105%',
      },
      boxShadow:{
        "shadow1": "0px -2px 4px 0px #00000080",
      }


    },
  },
  plugins: [],
}

