import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { generateRandomColor } from "../utils/colorUtils";
import { X } from "lucide-react";

const AddEventForm = ({
  onClose,
  preselectedKingId = null,
  initialData = null,
  initialBCE = null,
  isEditing = false,
  onSave = null,
}) => {
  const { addEvent, kings, dynasties, addOneTimeKing, uiSettings } =
    useDynasty();

  const initialSelectedKingIds = preselectedKingId ? [preselectedKingId] : [];

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    kingIds: initialSelectedKingIds,
    type: "",
    importance: "medium",
    ...(initialData || {}), // Use initialData if provided
  });

  const [dateBce, setDateBce] = useState(initialBCE?.dateBce || false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKings, setFilteredKings] = useState([]);
  const [selectedKings, setSelectedKings] = useState([]);
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [oneTimeKing, setOneTimeKing] = useState({
    name: "",
    dynastyName: "",
  });

  const [errors, setErrors] = useState({});

  // Initialize form data from initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Set BCE state if provided
  useEffect(() => {
    if (initialBCE && initialBCE.dateBce !== undefined) {
      setDateBce(initialBCE.dateBce);
    }
  }, [initialBCE]);

  // Initialize selected kings from preselected ID or from initialData
  useEffect(() => {
    const initKings = [];

    // Handle preselected king if provided
    if (preselectedKingId) {
      const king = kings.find((k) => k.id === preselectedKingId);
      if (king) {
        initKings.push({
          id: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName: king.dynastyId
            ? dynasties.find((d) => d.id === king.dynastyId)?.name
            : null,
        });
      }
    }

    // Handle kings from initialData if editing
    if (
      isEditing &&
      initialData &&
      initialData.kingIds &&
      initialData.kingIds.length > 0
    ) {
      initialData.kingIds.forEach((kingId) => {
        if (!initKings.find((k) => k.id === kingId)) {
          // Avoid duplicates
          const king = kings.find((k) => k.id === kingId);
          if (king) {
            initKings.push({
              id: king.id,
              name: king.name,
              dynastyId: king.dynastyId,
              dynastyName: king.dynastyId
                ? dynasties.find((d) => d.id === king.dynastyId)?.name
                : null,
            });
          }
        }
      });
    }

    if (initKings.length > 0) {
      setSelectedKings(initKings);
    }
  }, [preselectedKingId, kings, dynasties, isEditing, initialData]);

  // Filter kings based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredKings(kings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = kings.filter(
        (king) =>
          !formData.kingIds.includes(king.id) &&
          (king.name.toLowerCase().includes(query) ||
            (king.dynastyId &&
              dynasties
                .find((d) => d.id === king.dynastyId)
                ?.name.toLowerCase()
                .includes(query)))
      );
      setFilteredKings(filtered);
    }
  }, [searchQuery, kings, dynasties, formData.kingIds]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleOneTimeChange = (e) => {
    const { name, value } = e.target;
    setOneTimeKing({
      ...oneTimeKing,
      [name]: value,
    });

    // Clear error
    if (errors[`oneTime_${name}`]) {
      setErrors({
        ...errors,
        [`oneTime_${name}`]: null,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleShowAddOneTime = () => {
    // Auto-fill name from search query if available
    if (searchQuery.trim() !== "") {
      setOneTimeKing({
        ...oneTimeKing,
        name: searchQuery,
      });
    }
    setShowAddOneTime(true);
  };

  const addOneTimeKingToSelection = () => {
    // Validate
    if (!oneTimeKing.name.trim()) {
      setErrors({
        ...errors,
        oneTime_name: "Ruler name is required",
      });
      return;
    }

    // Create a temporary ID for the one-time king (will be replaced when saved)
    const tempId = `temp_${Date.now()}`;

    // Add to selected kings
    const newKing = {
      id: tempId,
      name: oneTimeKing.name,
      dynastyName: oneTimeKing.dynastyName || null,
      isOneTime: true,
    };
    
    setSelectedKings([...selectedKings, newKing]);
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, tempId],
    });

    // Reset form
    setOneTimeKing({
      name: "",
      dynastyName: "",
    });
    setShowAddOneTime(false);
  };

  const addKingFromSearch = (king) => {
    const dynastyName = king.dynastyId
      ? dynasties.find((d) => d.id === king.dynastyId)?.name
      : null;

    const newSelectedKing = {
      id: king.id,
      name: king.name,
      dynastyId: king.dynastyId,
      dynastyName,
    };

    setSelectedKings([...selectedKings, newSelectedKing]);
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, king.id],
    });

    setSearchQuery("");
  };

  const removeKing = (kingId) => {
    // Don't allow removal of preselected kings (from ruler page)
    if (preselectedKingId && kingId === preselectedKingId) {
      return;
    }

    setSelectedKings(selectedKings.filter((king) => king.id !== kingId));
    setFormData({
      ...formData,
      kingIds: formData.kingIds.filter((id) => id !== kingId),
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    // Date is encouraged but not strictly required
    if (!formData.date.trim()) {
      if (uiSettings?.validationLevel === "strict") {
        newErrors.date = "Date is required";
      }
    }

    // Validate that at least one ruler is selected
    if (formData.kingIds.length === 0) {
      newErrors.kingIds = "At least one ruler must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Process one-time kings if any
    const kingIdsMap = new Map();
    for (const king of selectedKings) {
      if (king.isOneTime) {
        // Create real one-time king
        const newKing = await addOneTimeKing({
          name: king.name,
          dynastyName: king.dynastyName,
          color: generateRandomColor(),
        });
        kingIdsMap.set(king.id, newKing.id);
      } else {
        kingIdsMap.set(king.id, king.id);
      }
    }

    // Replace temporary IDs with real ones
    const finalKingIds = formData.kingIds.map((id) =>
      kingIdsMap.has(id) ? kingIdsMap.get(id) : id
    );

    // Process date for BCE if needed
    let processedDate = formData.date;

    // If it's just a year and BCE is checked, convert to internal format
    if (
      processedDate &&
      processedDate.trim().length === 4 &&
      !isNaN(parseInt(processedDate)) &&
      dateBce
    ) {
      const year = parseInt(processedDate);
      const internalYear = -year + 1; // Convert to internal BCE format
      processedDate = internalYear.toString();
    }

    // Create event data
    const eventData = {
      name: formData.name,
      date: processedDate,
      description: formData.description,
      type: formData.type,
      importance: formData.importance,
      kingIds: finalKingIds,
    };

    // If editing, use the provided callback, otherwise add a new event
    if (isEditing && onSave) {
      onSave(eventData);
    } else {
      addEvent(eventData);
    }

    if (onClose) onClose();
  };

  const eventTypes = [
    "Religious",
    "Political",
    "Cultural",
    "Economic",
    "Scientific",
    "Diplomatic",
    "Military",
    "Other",
  ];

  const importanceLevels = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="text-xl font-bold mb-4 dark:text-white">
          Add New Historical Event
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.name
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          placeholder="e.g., Signing of Magna Carta"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Date
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.date
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder="YYYY-MM-DD or just YYYY"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="dateBce"
                checked={dateBce}
                onChange={() => setDateBce(!dateBce)}
                className="mr-1 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="dateBce" className="text-sm dark:text-gray-300">
                BCE
              </label>
            </div>
          </div>
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You can use YYYY-MM-DD format or just the year (YYYY)
          </p>
        </div>

        <div>
          <label
            htmlFor="importance"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Importance
          </label>
          <select
            id="importance"
            name="importance"
            value={formData.importance}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {importanceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Event Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Select Type</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Describe the historical event..."
        ></textarea>
      </div>

      {/* Kings/Rulers Selection Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium dark:text-white">
            Related Rulers
          </h3>
        </div>

        {/* Selected Kings Pills */}
        <div className="mb-4">
          {selectedKings.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedKings.map((king) => (
                <div
                  key={king.id}
                  className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm dark:text-gray-200"
                >
                  <span>{king.name}</span>
                  {king.dynastyName && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({king.dynastyName})
                    </span>
                  )}
                  {king.isOneTime && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      (One-time)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeKing(king.id)}
                    className={`ml-2 ${
                      preselectedKingId && king.id === preselectedKingId
                        ? "hidden"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    disabled={
                      preselectedKingId && king.id === preselectedKingId
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`text-sm mb-3 ${
                errors.kingIds
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              No rulers selected yet.
            </p>
          )}
          {errors.kingIds && (
            <p className="text-red-500 text-xs">{errors.kingIds}</p>
          )}
        </div>

        {/* King Search and Add */}
        <div className="mb-4">
          <div className="flex space-x-2 mb-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for rulers..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              type="button"
              onClick={handleShowAddOneTime}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Add One-time
            </button>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md mb-3 bg-white dark:bg-gray-800">
              {filteredKings.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredKings.map((king) => {
                    const dynastyName = king.dynastyId
                      ? dynasties.find((d) => d.id === king.dynastyId)?.name
                      : "No dynasty";

                    return (
                      <li
                        key={king.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => addKingFromSearch(king)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium dark:text-white">
                              {king.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                              ({dynastyName})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {king.startYear}
                            {king.endYear ? `-${king.endYear}` : ""}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  No matching rulers found
                </div>
              )}
            </div>
          )}

          {/* Add One-time King Form */}
          {showAddOneTime && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-3 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm font-medium mb-2 dark:text-white">
                Add a one-time ruler
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={oneTimeKing.name}
                    onChange={handleOneTimeChange}
                    placeholder="Ruler name *"
                    className={`w-full p-2 border ${
                      errors.oneTime_name
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
                  />
                  {errors.oneTime_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.oneTime_name}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="dynastyName"
                    value={oneTimeKing.dynastyName}
                    onChange={handleOneTimeChange}
                    placeholder="Dynasty name (optional)"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOneTime(false)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addOneTimeKingToSelection}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditing ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
