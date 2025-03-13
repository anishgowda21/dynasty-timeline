import React, { useCallback, useMemo } from "react";
import { useDynasty } from "../context/DynastyContext";

// Memoized dynasty checkbox component to prevent unnecessary re-renders
const DynastyCheckbox = React.memo(({ dynasty, isSelected, onToggle }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={`dynasty-${dynasty.id}`}
        checked={isSelected}
        onChange={() => onToggle(dynasty.id)}
        className="h-4 w-4 text-dynasty-primary border-gray-300 rounded focus:ring-dynasty-primary"
      />
      <label
        htmlFor={`dynasty-${dynasty.id}`}
        className="ml-2 flex items-center"
      >
        <span
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: dynasty.color }}
        ></span>
        <span>{dynasty.name}</span>
        <span className="text-gray-500 text-xs ml-1">
          ({dynasty.startYear}
          {dynasty.endYear ? ` - ${dynasty.endYear}` : ""})
        </span>
      </label>
    </div>
  );
});

const DynastySelector = () => {
  const {
    dynasties,
    uiSettings,
    toggleDynastySelection,
    setSelectedDynasties,
  } = useDynasty();

  // Memoize the selected dynasties set for faster lookups
  const selectedDynastiesSet = useMemo(() => {
    return new Set(uiSettings.selectedDynasties);
  }, [uiSettings.selectedDynasties]);

  // Use useCallback to memoize event handlers
  const handleToggle = useCallback((dynastyId) => {
    toggleDynastySelection(dynastyId);
  }, [toggleDynastySelection]);

  const handleSelectAll = useCallback(() => {
    setSelectedDynasties(dynasties.map((dynasty) => dynasty.id));
  }, [dynasties, setSelectedDynasties]);

  const handleSelectNone = useCallback(() => {
    setSelectedDynasties([]);
  }, [setSelectedDynasties]);

  const handleInvert = useCallback(() => {
    const invertedSelection = dynasties
      .map((dynasty) => dynasty.id)
      .filter((id) => !selectedDynastiesSet.has(id));

    setSelectedDynasties(invertedSelection);
  }, [dynasties, selectedDynastiesSet, setSelectedDynasties]);

  // Memoize the dynasty list items
  const dynastyItems = useMemo(() => {
    return dynasties.map((dynasty) => (
      <DynastyCheckbox
        key={dynasty.id}
        dynasty={dynasty}
        isSelected={selectedDynastiesSet.has(dynasty.id)}
        onToggle={handleToggle}
      />
    ));
  }, [dynasties, selectedDynastiesSet, handleToggle]);

  // Memoize the status text
  const statusText = useMemo(() => {
    return `Showing ${uiSettings.selectedDynasties.length} of ${dynasties.length} dynasties`;
  }, [uiSettings.selectedDynasties.length, dynasties.length]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Filter Dynasties</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors dark:text-white"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors dark:text-white"
          >
            Clear All
          </button>
          <button
            onClick={handleInvert}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors dark:text-white"
          >
            Invert
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {dynastyItems}
      </div>

      <div className="mt-3 text-sm text-gray-500">
        {statusText}
      </div>
    </div>
  );
};

export default React.memo(DynastySelector);
