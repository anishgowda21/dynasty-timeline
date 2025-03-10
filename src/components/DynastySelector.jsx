import { useDynasty } from "../context/DynastyContext";

const DynastySelector = () => {
  const {
    dynasties,
    uiSettings,
    toggleDynastySelection,
    setSelectedDynasties,
  } = useDynasty();

  const handleToggle = (dynastyId) => {
    toggleDynastySelection(dynastyId);
  };

  const handleSelectAll = () => {
    setSelectedDynasties(dynasties.map((dynasty) => dynasty.id));
  };

  const handleSelectNone = () => {
    setSelectedDynasties([]);
  };

  const handleInvert = () => {
    const currentlySelected = new Set(uiSettings.selectedDynasties);
    const invertedSelection = dynasties
      .map((dynasty) => dynasty.id)
      .filter((id) => !currentlySelected.has(id));

    setSelectedDynasties(invertedSelection);
  };

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
        {dynasties.map((dynasty) => (
          <div key={dynasty.id} className="flex items-center">
            <input
              type="checkbox"
              id={`dynasty-${dynasty.id}`}
              checked={uiSettings.selectedDynasties.includes(dynasty.id)}
              onChange={() => handleToggle(dynasty.id)}
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
        ))}
      </div>

      <div className="mt-3 text-sm text-gray-500">
        {`Showing ${uiSettings.selectedDynasties.length} of ${dynasties.length} dynasties`}
      </div>
    </div>
  );
};

export default DynastySelector;
