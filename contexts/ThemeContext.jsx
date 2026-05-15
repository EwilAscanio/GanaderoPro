"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState("blue");

  useEffect(() => {
    const root = document.documentElement;
    const storedDark = localStorage.getItem("darkMode");
    const storedAccent = localStorage.getItem("accentColor");
    const dark = storedDark === "true";
    const accent = storedAccent && storedAccent !== "blue" ? storedAccent : null;

    setDarkMode(dark);
    setAccentColor(accent || "blue");

    // Apply classes immediately — prevents flash if React stripped them during hydration
    if (dark) {
      root.classList.add("dark");
    }
    root.classList.remove("theme-red", "theme-green", "theme-purple", "theme-orange");
    if (accent) {
      root.classList.add(`theme-${accent}`);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-red", "theme-green", "theme-purple", "theme-orange");
    if (accentColor !== "blue") {
      root.classList.add(`theme-${accentColor}`);
    }
    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  const toggleDark = () => setDarkMode((prev) => !prev);
  const changeAccent = (color) => setAccentColor(color);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark, accentColor, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
