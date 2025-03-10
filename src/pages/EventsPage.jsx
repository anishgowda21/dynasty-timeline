import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import EventCard from "../components/EventCard";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";
import { Link } from "react-router-dom";

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
        const eventYear = parseInt(event.date.split("-")[0]);
        return eventYear >= startYear;
      });
    }

    if (filters.endYear) {
      const endYear = parseInt(filters.endYear);
      filtered = filtered.filter((event) => {
        const eventYear = parseInt(event.date.split("-")[0]);
        return eventYear <= endYear;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          // Search by king name
          event.kingIds.some((kingId) => {
            const king = kings.find((k) => k.id === kingId);
            return king && king.name.toLowerCase().includes(searchLower);
          })
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
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
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          Historical Events
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-2 top-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
            <Link key={event.id} to={`/events/${event.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">
                        {event.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {event.type && (
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeClass(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getImportanceClass(
                          event.importance
                        )}`}
                      >
                        {event.importance.charAt(0).toUpperCase() +
                          event.importance.slice(1)}{" "}
                        Importance
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {event.description}
                  </p>

                  {getRelatedKings(event).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Related Rulers:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {getRelatedKings(event).map((king) => (
                          <span
                            key={king.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          >
                            {king.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
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
