import { useState, useRef } from "react";
import { useDynasty } from "../context/DynastyContext";
import Modal from "../components/Modal";

const SettingsPage = () => {
  const {
    uiSettings,
    toggleDarkMode,
    setValidationLevel,
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
  } = useDynasty();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState({
    message: "",
    isError: false,
  });
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const jsonData = exportData();
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `dynasty-timeline-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    setImportStatus({ message: "", isError: false });
    setShowImportModal(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await importData(file);
      setImportStatus({
        message: "Data imported successfully!",
        isError: false,
      });
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus({ message: "", isError: false });
      }, 2000);
    } catch (error) {
      setImportStatus({
        message: `Import error: ${error.message}`,
        isError: true,
      });
    }

    // Reset the file input
    e.target.value = null;
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset to sample data? This will replace all your current data."
      )
    ) {
      resetToSampleData();
      alert("Data has been reset to sample data");
    }
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone."
      )
    ) {
      clearAllData();
      alert("All data has been cleared");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Display Settings</h2>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={uiSettings.darkMode}
                onChange={toggleDarkMode}
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  uiSettings.darkMode ? "bg-dynasty-primary" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  uiSettings.darkMode ? "transform translate-x-6" : ""
                }`}
              ></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">Dark Mode</div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validation Level
          </label>
          <select
            value={uiSettings.validationLevel}
            onChange={(e) => setValidationLevel(e.target.value)}
            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md"
          >
            <option value="none">Off</option>
            <option value="warn">Warning Only</option>
            <option value="strict">Strict</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Data Management</h2>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
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
            <h3 className="text-lg font-semibold mb-2">Import/Export</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
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
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Reset Data</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
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

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)}>
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-4">Import Data</h3>
          {importStatus.message ? (
            <div
              className={`p-4 mb-4 rounded-md ${
                importStatus.isError
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {importStatus.message}
            </div>
          ) : (
            <>
              <p className="mb-6">
                Select a JSON file to import. This will replace your current
                data.
              </p>
              <div className="flex flex-col items-center">
                <button
                  onClick={handleFileSelect}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
                >
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <p className="text-sm text-gray-500">
                  Only .json files are supported
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
