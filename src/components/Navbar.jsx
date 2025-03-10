import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import ConfirmationDialog from "./ConfirmationDialog";

const Navbar = () => {
  const location = useLocation();
  const {
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
    validationWarnings,
  } = useDynasty();
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

  // Check if we're in a detail view
  const isDetailView = () => {
    const path = location.pathname;
    return (
      path.includes("/kings/") ||
      path.includes("/dynasties/") ||
      path.includes("/events/") ||
      path.includes("/wars/")
    );
  };

  // Get the parent route for "Back to" navigation
  const getParentRoute = () => {
    const path = location.pathname;
    if (path.includes("/kings/")) return "/";
    if (path.includes("/dynasties/")) return "/";
    if (path.includes("/events/")) return "/events";
    if (path.includes("/wars/")) return "/wars";
    return "/";
  };

  // Get the parent route name for display
  const getParentName = () => {
    const path = location.pathname;
    if (path.includes("/kings/")) return "Dynasties";
    if (path.includes("/dynasties/")) return "Dynasties";
    if (path.includes("/events/")) return "Events";
    if (path.includes("/wars/")) return "Wars";
    return "Home";
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          {isDetailView() ? (
            <Link
              to={getParentRoute()}
              state={{ from: location.pathname }}
              className="text-dynasty-primary hover:underline flex items-center mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to {getParentName()}
            </Link>
          ) : (
            <Link to="/" className="text-2xl font-bold text-dynasty-primary">
              Dynasty Timeline
            </Link>
          )}
        </div>

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
              location.pathname.startsWith("/events") ? "nav-link-active" : ""
            }`}
          >
            Events
          </Link>

          <Link
            to="/wars"
            className={`nav-link ${
              location.pathname.startsWith("/wars") ? "nav-link-active" : ""
            }`}
          >
            Wars
          </Link>

          <Link
            to="/settings"
            className={`p-2 rounded-full hover:bg-gray-100 ${
              location.pathname.startsWith("/settings") ? "bg-gray-200" : ""
            }`}
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
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
