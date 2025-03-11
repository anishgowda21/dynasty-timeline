import { useState, useRef } from "react";
import { useDynasty } from "../context/DynastyContext";
import { useDarkMode } from "../context/DarkModeContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { Download, Info, RefreshCcw, Trash, Upload } from "lucide-react";
import toast from "react-hot-toast";

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
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const {
    uiSettings,
    setValidationLevel,
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
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
      const importedData = JSON.parse(text);
      importData(importedData);
      setShowImportDialog(false);
      setSelectedFile(null);
      toast("Data imported successfully!", {
        position: "top-right",
        icon: "✅",
      });
    } catch (error) {
      console.error("Error importing data:", error);
      toast("Error importing data!", {
        position: "top-right",
        icon: "❌",
      });
    }
  };

  const handleReset = () => {
    setShowResetDialog(true);
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  return (
    <div className="settings-page max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      <div className="space-y-6">
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
              className="w-full sm:w-auto p-1 m-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <Info className="mr-2" />
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
                  <Download className="mr-2" />
                  Export Data
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  type="button"
                >
                  <Upload className="mr-2" />
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
                  <RefreshCcw className="mr-2" />
                  Reset to Sample Data
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  type="button"
                >
                  <Trash className="mr-2" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          toast("Date reset successfull!", {
            position: "top-right",
            icon: "✅",
          });
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
          toast("Date cleared successfully!", {
            position: "top-right",
            icon: "✅",
          });
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
