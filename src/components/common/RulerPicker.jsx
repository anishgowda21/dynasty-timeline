import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { useDynasty } from "../../context/DynastyContext";

/**
 * Reusable component for picking rulers with search and one-time creation
 * Memoized to prevent unnecessary re-renders
 */
const RulerPicker = React.memo(({
  selectedRulers = [],
  onAddRuler,
  onRemoveRuler,
  onUpdateRuler,
  error,
  preselectedKingId = null,
  showRoles = false,
  roleOptions = [],
}) => {
  const { kings, dynasties } = useDynasty();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKings, setFilteredKings] = useState([]);
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [oneTimeKing, setOneTimeKing] = useState({
    name: "",
    dynastyName: "",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(
    showRoles
      ? roleOptions.length > 0
        ? roleOptions[0].value
        : "participant"
      : null
  );

  // Filter kings based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredKings(kings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = kings.filter(
        (king) =>
          !selectedRulers.some(
            (r) => r.id === king.id || r.kingId === king.id
          ) &&
          (king.name.toLowerCase().includes(query) ||
            (king.dynastyId &&
              dynasties
                .find((d) => d.id === king.dynastyId)
                ?.name.toLowerCase()
                .includes(query)))
      );
      setFilteredKings(filtered);
    }
  }, [searchQuery, kings, dynasties, selectedRulers]);

  // Memoize event handlers to prevent recreation on each render
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleShowAddOneTime = useCallback(() => {
    // Auto-fill name from search query if available
    if (searchQuery.trim() !== "") {
      setOneTimeKing((prevState) => ({
        ...prevState,
        name: searchQuery,
      }));
    }
    setShowAddOneTime(true);
  }, [searchQuery]);

  const handleOneTimeChange = useCallback((e) => {
    const { name, value } = e.target;
    setOneTimeKing((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error
    if (errors[`oneTime_${name}`]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`oneTime_${name}`]: null,
      }));
    }
  }, [errors]);

  const handleRoleChange = useCallback((e) => {
    setRole(e.target.value);
  }, []);

  const addOneTimeKingToSelection = useCallback(() => {
    // Validate
    if (!oneTimeKing.name.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        oneTime_name: "Ruler name is required",
      }));
      return;
    }

    // Create a temporary ID for the one-time king
    const tempId = `temp_${Date.now()}`;

    // Create the new king object
    const newKing = {
      id: tempId,
      kingId: tempId,
      name: oneTimeKing.name,
      dynastyName: oneTimeKing.dynastyName || null,
      isOneTime: true,
      ...(showRoles ? { role } : {}),
    };

    // Add to selected kings
    onAddRuler(newKing);

    // Reset forms
    setOneTimeKing({
      name: "",
      dynastyName: "",
    });
    setShowAddOneTime(false);
  }, [oneTimeKing, onAddRuler, role, showRoles]);

  const addKingFromSearch = useCallback((king) => {
    const dynastyName = king.dynastyId
      ? dynasties.find((d) => d.id === king.dynastyId)?.name
      : null;

    const newRuler = {
      id: king.id,
      kingId: king.id,
      name: king.name,
      dynastyId: king.dynastyId,
      dynastyName,
      ...(showRoles ? { role } : {}),
    };

    onAddRuler(newRuler);
    setSearchQuery("");
  }, [dynasties, onAddRuler, role, showRoles]);

  const updateRulerRole = useCallback((ruler, newRole) => {
    if (onUpdateRuler) {
      onUpdateRuler({
        ...ruler,
        role: newRole,
      });
    }
  }, [onUpdateRuler]);

  const handleCancelOneTime = useCallback(() => {
    setShowAddOneTime(false);
  }, []);

  // Memoize the role options elements to prevent recreation on each render
  const roleOptionElements = useMemo(() => {
    return roleOptions.map((roleOpt) => (
      <option key={roleOpt.value} value={roleOpt.value}>
        {roleOpt.label}
      </option>
    ));
  }, [roleOptions]);

  // Memoize the selected rulers display to prevent recreation on each render
  const selectedRulersDisplay = useMemo(() => {
    if (selectedRulers.length === 0) {
      return (
        <p
          className={`text-sm mb-3 ${
            error ? "text-red-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          No rulers selected yet.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedRulers.map((ruler, index) => {
          const isPreselected = preselectedKingId && 
            (ruler.id === preselectedKingId || ruler.kingId === preselectedKingId);
          
          return (
            <div
              key={ruler.id || ruler.kingId || index}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
            >
              <span className="font-medium dark:text-white">
                {ruler.name}
              </span>
              {ruler.dynastyName && (
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  ({ruler.dynastyName})
                </span>
              )}
              {ruler.isOneTime && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  (One-time)
                </span>
              )}

              <div className="flex items-center ml-2">
                {showRoles && roleOptions.length > 0 && (
                  <select
                    value={ruler.role}
                    onChange={(e) => updateRulerRole(ruler, e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm mr-2"
                  >
                    {roleOptionElements}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveRuler(ruler)}
                  className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${
                    isPreselected ? "hidden" : ""
                  }`}
                  disabled={isPreselected}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [selectedRulers, error, preselectedKingId, showRoles, roleOptions.length, roleOptionElements, updateRulerRole, onRemoveRuler]);

  // Memoize the filtered kings list to prevent recreation on each render
  const filteredKingsList = useMemo(() => {
    if (!searchQuery || showAddOneTime || filteredKings.length === 0) {
      return null;
    }

    if (filteredKings.length === 0) {
      return (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
          No matching rulers found
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredKings.map((king) => {
          const dynastyName = king.dynastyId
            ? dynasties.find((d) => d.id === king.dynastyId)?.name
            : null;

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
                    ({dynastyName || "No dynasty"})
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
    );
  }, [searchQuery, showAddOneTime, filteredKings, dynasties, addKingFromSearch]);

  return (
    <div>
      {/* Selected Rulers Display */}
      <div className="mb-4">
        {selectedRulersDisplay}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      {/* Search Field and Role Selection */}
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
      {searchQuery && !showAddOneTime && (
        <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md mb-3 bg-white dark:bg-gray-800">
          {filteredKingsList}
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
              onClick={handleCancelOneTime}
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
  );
});

export default RulerPicker;
