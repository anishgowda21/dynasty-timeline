import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

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
              <svg
                className="h-8 w-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
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
              {darkMode ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
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
              {menuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
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
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
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
