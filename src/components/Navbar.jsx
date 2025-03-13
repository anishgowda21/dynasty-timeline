import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { Menu, Moon, Sun, X } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  // Helper to determine if a nav link is active
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className="bg-dynasty-primary dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Site Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo className="text-white h-8 w-8" />
              <span className="ml-2 text-white font-bold text-xl">
                Dynasty Timeline
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/")
                  ? "text-white bg-dynasty-primary-dark"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/events")
                  ? "text-white bg-dynasty-primary-dark"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
            >
              Events
            </Link>
            <Link
              to="/wars"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/wars")
                  ? "text-white bg-dynasty-primary-dark"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
            >
              Wars
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/settings")
                  ? "text-white bg-dynasty-primary-dark"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
            >
              Settings
            </Link>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="ml-3 p-2 rounded-full text-dynasty-primary-light hover:text-white focus:outline-none dark:text-gray-400 dark:hover:text-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dynasty-primary-light hover:text-white focus:outline-none"
              aria-label="Main menu"
              aria-expanded="false"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dynasty-primary-dark dark:bg-gray-900">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/")
                  ? "text-white bg-dynasty-primary"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/events")
                  ? "text-white bg-dynasty-primary"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/wars"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/wars")
                  ? "text-white bg-dynasty-primary"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
              onClick={() => setMenuOpen(false)}
            >
              Wars
            </Link>
            <Link
              to="/settings"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/settings")
                  ? "text-white bg-dynasty-primary"
                  : "text-dynasty-primary-light hover:text-white"
              } dark:text-gray-300 dark:hover:text-white`}
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>

            {/* Dark Mode Toggle for Mobile */}
            <button
              onClick={() => {
                toggleDarkMode();
                setMenuOpen(false);
              }}
              className="flex w-full px-3 py-2 rounded-md text-sm font-medium text-dynasty-primary-light hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              {darkMode ? (
                <>
                  <Sun className="mr-2" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} className="mr-2" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
