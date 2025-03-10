import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import ConfirmationDialog from "./ConfirmationDialog";

const Navbar = () => {
  const location = useLocation();
  const { exportData, importData, resetToSampleData, clearAllData } =
    useDynasty();
  const [importError, setImportError] = useState("");
  const [showDataMenu, setShowDataMenu] = useState(false);

  // Dialog states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setSelectedFile(file);
      setShowImportDialog(true);
    };

    input.click();
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;

    try {
      await importData(selectedFile);
      setImportError("");
    } catch (error) {
      setImportError(error.message);
    } finally {
      setShowImportDialog(false);
      setSelectedFile(null);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-dynasty-primary">
          Dynasty Timeline
        </Link>

        <div className="flex space-x-4 items-center">
          <Link
            to="/"
            className={`nav-link ${
              location.pathname === "/" ? "nav-link-active" : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/events"
            className={`nav-link ${
              location.pathname === "/events" ? "nav-link-active" : ""
            }`}
          >
            Events
          </Link>

          <Link
            to="/wars"
            className={`nav-link ${
              location.pathname === "/wars" ? "nav-link-active" : ""
            }`}
          >
            Wars
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="btn btn-secondary flex items-center"
            >
              Data Management
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showDataMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      exportData();
                      setShowDataMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export Data
                  </button>

                  <button
                    onClick={() => {
                      handleImportClick();
                      setShowDataMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Import Data
                  </button>

                  <button
                    onClick={() => {
                      setShowResetDialog(true);
                      setShowDataMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Reset to Sample Data
                  </button>

                  <button
                    onClick={() => {
                      setShowClearDialog(true);
                      setShowDataMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-dynasty-accent"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showResetDialog}
        title="Reset to Sample Data"
        message="Are you sure you want to reset to sample data? This will overwrite all your current data with the default dataset."
        confirmText="Reset Data"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        onConfirm={() => {
          resetToSampleData();
          setShowResetDialog(false);
        }}
        onCancel={() => setShowResetDialog(false)}
      />

      <ConfirmationDialog
        isOpen={showClearDialog}
        title="Clear All Data"
        message="Are you sure you want to clear all data? This action cannot be undone and will remove all dynasties, rulers, events, and wars."
        confirmText="Clear All Data"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={() => {
          clearAllData();
          setShowClearDialog(false);
        }}
        onCancel={() => setShowClearDialog(false)}
      />

      <ConfirmationDialog
        isOpen={showImportDialog}
        title="Import Data"
        message={`Are you sure you want to import data from "${selectedFile?.name}"? This will overwrite your current data.`}
        confirmText="Import"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        onConfirm={handleImportConfirm}
        onCancel={() => {
          setShowImportDialog(false);
          setSelectedFile(null);
        }}
      />

      {importError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mt-2 rounded container mx-auto">
          Import Error: {importError}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
