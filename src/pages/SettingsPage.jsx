import { useState, useRef } from "react";
import { useDynasty } from "../context/DynastyContext";
import { useDarkMode } from "../context/DarkModeContext";
import Modal from "../components/Modal";
import ConfirmationDialog from "../components/ConfirmationDialog";

// Tooltip component
const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-md shadow-lg -left-1/2 dark:bg-gray-700">
          {content}
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const {
    uiSettings,
    setValidationLevel,
    toggleDarkMode,
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
    resetDynasties,
  } = useDynasty();

  const { darkMode, toggleDarkMode: toggleDarkModeContext } = useDarkMode();

  const handleExport = () => {
    exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setShowImportDialog(true);
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      importData(data);
      setShowImportDialog(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data. Please check the file format.");
    }
  };

  const handleReset = () => {
    setShowResetDialog(true);
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Apply dark mode from context to the dynasty context
    toggleDarkMode(darkMode);

    // Show a success message or notification
    alert("Settings saved successfully!");
  };

  return (
    <div className="settings-page max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dark Mode Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Display Settings
          </h2>

          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={darkMode}
                  onChange={toggleDarkModeContext}
                />
                <div
                  className={`block w-14 h-8 rounded-full ${
                    darkMode ? "bg-dynasty-primary" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                    darkMode ? "transform translate-x-6" : ""
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-gray-700 dark:text-white font-medium">
                Dark Mode
              </div>
            </label>
          </div>

          <div className="mb-4">
            <Tooltip content="Controls how strictly the app validates timeline data. 'Off' disables validation, 'Warning Only' shows warnings but allows saving, 'Strict' prevents saving invalid data.">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Validation Level
              </label>
            </Tooltip>

            <select
              value={uiSettings.validationLevel}
              onChange={(e) => setValidationLevel(e.target.value)}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">Off</option>
              <option value="warn">Warning Only</option>
              <option value="strict">Strict</option>
            </select>

            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Off</strong>: No validation warnings, allows all data
                  regardless of historical consistency.
                </li>
                <li>
                  <strong>Warning Only</strong>: Shows warnings but allows
                  saving inconsistent data.
                </li>
                <li>
                  <strong>Strict</strong>: Prevents saving data that fails
                  validation checks.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Data Management
          </h2>

          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-4 rounded-md mb-6">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                <strong>Important:</strong> All data is stored locally in your
                browser. To avoid data loss, export your data regularly.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Import/Export
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export Data
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      transform="rotate(180 10 10)"
                    />
                  </svg>
                  Import Data
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Reset Data
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reset to Sample Data
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-dynasty-primary hover:bg-dynasty-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-200"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showResetDialog}
        title="Reset to Sample Data"
        message="Are you sure you want to reset to sample data? This will overwrite all your current data with the default dataset."
        confirmText="Reset Data"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
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
    </div>
  );
};

export default SettingsPage;
