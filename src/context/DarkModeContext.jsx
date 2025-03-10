import { createContext, useContext, useEffect, useState } from "react";

// Create the context
const DarkModeContext = createContext();

// Custom hook to use the dark mode context
export const useDarkMode = () => useContext(DarkModeContext);

// Provider component
export const DarkModeProvider = ({ children }) => {
  // Check localStorage or use system preference as default
  const getInitialDarkMode = () => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // Default to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Update localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Apply/remove dark class on the document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeContext;
