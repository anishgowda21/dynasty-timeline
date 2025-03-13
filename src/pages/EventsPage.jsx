import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import EventCard from "../components/EventCard";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";
import { Plus, X, Search } from "lucide-react";
import { setPageTitle } from "../utils/titleUtils";

const EventsPage = () => {
  const { events, kings, loading, deleteEvent } = useDynasty();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    importance: "",
    startYear: "",
    endYear: "",
    search: "",
  });

  // Set page title when component mounts
  useEffect(() => {
    setPageTitle("Historical Events");
  }, []);

  useEffect(() => {
    // Filter out war events and apply filters
    const nonWarEvents = events.filter(
      (event) => event.type !== "War" && !event.isWar
    );

    let filtered = [...nonWarEvents];

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((event) => event.type === filters.type);
    }

    // Apply importance filter
    if (filters.importance) {
      filtered = filtered.filter(
        (event) => event.importance === filters.importance
      );
    }

    // Apply year range filter
    if (filters.startYear) {
      const startYear = parseInt(filters.startYear);
      filtered = filtered.filter((event) => {
        const eventYear = parseInt(String(event.date).split("-")[0]);
        return !isNaN(eventYear) && eventYear >= startYear;
      });
    }

    if (filters.endYear) {
      const endYear = parseInt(filters.endYear);
      filtered = filtered.filter((event) => {
        const eventYear = parseInt(String(event.date).split("-")[0]);
        return !isNaN(eventYear) && eventYear <= endYear;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          (event.name && event.name.toLowerCase().includes(searchLower)) ||
          (event.description &&
            event.description.toLowerCase().includes(searchLower)) ||
          // Search by king name
          event.kingIds.some((kingId) => {
            const king = kings.find((k) => k.id === kingId);
            return king && king.name.toLowerCase().includes(searchLower);
          })
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      // Handle BCE years correctly (negative years)
      const yearA = parseInt(String(a.date).split("-")[0]);
      const yearB = parseInt(String(b.date).split("-")[0]);

      if (!isNaN(yearA) && !isNaN(yearB)) {
        return yearB - yearA; // Sort numerically
      }

      // Fall back to string comparison if we can't parse the years
      return String(b.date).localeCompare(String(a.date));
    });

    setFilteredEvents(filtered);
  }, [events, kings, filters]);

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
    });
  };

  const getRelatedKings = (event) => {
    return kings.filter((king) => event.kingIds.includes(king.id));
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
        <h1 className="text-3xl font-bold text-dynasty-text dark:text-white">
          Historical Events
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Event
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Filter Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            >
              <option value="">All Types</option>
              {eventTypes.map((type) => (
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
                placeholder="Search events..."
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
        Showing {filteredEvents.length} events
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            No events found with the current filters.
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
              Add Your First Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              kings={getRelatedKings(event)}
              showLink={true}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddEventForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
};

export default EventsPage;
