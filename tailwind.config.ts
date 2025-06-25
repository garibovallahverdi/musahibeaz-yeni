import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: "class", 
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
        colors: {
          background: "rgb(var(--background) / <alpha-value>)",
          card_bg: "rgb(var(--card_bg) / <alpha-value>)",
          titleText: "rgb(var(--titleText) / <alpha-value>)",
          tagText: "rgb(var(--tagText) / <alpha-value>)",
          contentText: "rgb(var(--contentText) / <alpha-value>)",
          border: "rgb(var(--border) / <alpha-value>)",
          hoverTitle: "rgb(var(--hoverTitle) / <alpha-value>)",
          hoverTag: "rgb(var(--hoverTag) / <alpha-value>)",
          hoverContent: "rgb(var(--hoverContent) / <alpha-value>)",
  
          buttonBg: "rgb(var(--buttonBg) / <alpha-value>)",
          buttonHoverBg: "rgb(var(--buttonHoverBg) / <alpha-value>)",
          buttonDisabledBg: "rgb(var(--buttonDisabledBg) / <alpha-value>)",
          buttonDisabledText: "rgb(var(--buttonDisabledText) / <alpha-value>)",
  
          inputBg: "rgb(var(--input) / <alpha-value>)",
          inputBorder: "rgb(var(--inputBorder) / <alpha-value>)",
          inputPlaceholder: "rgb(var(--inputFocus) / <alpha-value>)",
  
          success: "rgb(var(--success) / <alpha-value>)",
          warning: "rgb(var(--warning) / <alpha-value>)",
          danger: "rgb(var(--danger) / <alpha-value>)",
        },
      container: {
        center: true, // Container'ı ortalar
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          md: "3rem",
          lg: "4rem",
          xl: "5rem",
        },

        screens: {
          sm: "100%",
          md: "100%",
          lg: "1200px",
          xl: "1360px",
        },

        
    
      }
  
    }

    
  },
  plugins: [],
} satisfies Config;
