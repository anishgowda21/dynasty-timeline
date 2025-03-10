import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Check if dark mode should be enabled based on localStorage or system preference
const checkDarkMode = () => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode !== null) {
    return JSON.parse(savedMode);
  }
  // Default to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// Apply dark mode class to the document if needed
if (checkDarkMode()) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
