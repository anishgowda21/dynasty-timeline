import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import WarCard from "../components/WarCard";
import Modal from "../components/Modal";
import AddWarForm from "../components/AddWarForm";
import BackButton from "../components/BackButton";
import { Plus, X, Search } from "lucide-react";

const WarsPage = () => {
  const { wars, kings, dynasties, loading } = useDynasty();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredWars, setFilteredWars] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    importance: "",
    startYear: "",
    endYear: "",
    search: "",
    participant: "",
  });

  useEffect(() => {
    let filtered = [...wars];

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((war) => war.type === filters.type);
    }

    // Apply importance filter
    if (filters.importance) {
      filtered = filtered.filter(
        (war) => war.importance === filters.importance
      );
    }

    // Apply year range filter
    if (filters.startYear) {
      const startYear = parseInt(filters.startYear);
      filtered = filtered.filter((war) => war.startYear >= startYear);
    }

    if (filters.endYear) {
      const endYear = parseInt(filters.endYear);
      filtered = filtered.filter((war) => {
        // Use end year if available, otherwise use start year
        const warEndYear = war.endYear || war.startYear;
        return warEndYear <= endYear;
      });
    }

    // Apply participant filter (king or dynasty)
    if (filters.participant) {
      const participantLower = filters.participant.toLowerCase();
      filtered = filtered.filter((war) => {
        // Check if any participant matches the search
        return (
          war.participants &&
          war.participants.some((p) => {
            if (p.name && p.name.toLowerCase().includes(participantLower)) {
              return true;
            }
            if (
              p.dynastyName &&
              p.dynastyName.toLowerCase().includes(participantLower)
            ) {
              return true;
            }
            if (p.kingId) {
              const king = kings.find((k) => k.id === p.kingId);
              if (king && king.name.toLowerCase().includes(participantLower)) {
                return true;
              }
              if (king && king.dynastyId) {
                const dynasty = dynasties.find((d) => d.id === king.dynastyId);
                return (
                  dynasty &&
                  dynasty.name.toLowerCase().includes(participantLower)
                );
              }
            }
            return false;
          })
        );
      });
    }

    // Apply search filter (general search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (war) =>
          war.name.toLowerCase().includes(searchLower) ||
          (war.description &&
            war.description.toLowerCase().includes(searchLower)) ||
          (war.location && war.location.toLowerCase().includes(searchLower))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.startYear - a.startYear);

    setFilteredWars(filtered);
  }, [wars, kings, dynasties, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      importance: "",
      startYear: "",
      endYear: "",
      search: "",
      participant: "",
    });
  };

  const warTypes = [
    "Conquest",
    "Civil War",
    "Succession",
    "Religious",
    "Trade",
    "Naval",
    "Colonial",
    "Territorial",
    "Other",
  ];

  const importanceLevels = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Wars & Conflicts
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add War/Conflict
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Filter Wars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            >
              <option value="">All Types</option>
              {warTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Importance
            </label>
            <select
              name="importance"
              value={filters.importance}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            >
              <option value="">All Importance</option>
              {importanceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="startYear"
                placeholder="From Year"
                value={filters.startYear}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              />
              <input
                type="number"
                name="endYear"
                placeholder="To Year"
                value={filters.endYear}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search wars..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              />
              <Search className="h-5 w-5 absolute right-2 top-2 text-gray-400" />
            </div>
          </div>
        </div>
        {(filters.type ||
          filters.importance ||
          filters.startYear ||
          filters.endYear ||
          filters.search) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredWars.length} wars
      </div>

      {filteredWars.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            No wars or conflicts found with the current filters.
          </p>
          {filters.type ||
          filters.importance ||
          filters.startYear ||
          filters.endYear ||
          filters.search ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              Add Your First War/Conflict
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWars.map((war) => (
            <WarCard key={war.id} war={war} kings={kings} showLink={true} />
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddWarForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
};

export default WarsPage;
