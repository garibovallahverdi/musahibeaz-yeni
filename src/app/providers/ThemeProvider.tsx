'use client'
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. ThemeContext için tür tanımı
type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

// 2. Varsayılan değer olarak null kullanımı (TypeScript'te başlangıç değerini zorunlu kılıyor)
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. ThemeProvider için tür tanımı
type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(()=>{
    setTheme(localStorage.getItem("theme") ?? "light")
  },[])
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (theme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. useTheme için tür denetimi
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
