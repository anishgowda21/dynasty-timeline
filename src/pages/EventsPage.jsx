import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import AddEventForm from '../components/AddEventForm';

const EventsPage = () => {
  const { events, kings, loading, deleteEvent } = useDynasty();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    importance: '',
    startYear: '',
    endYear: '',
    search: ''
  });

  useEffect(() => {
    // Filter out war events and apply filters
    const nonWarEvents = events.filter(event => event.type !== 'War' && !event.isWar);
    
    let filtered = [...nonWarEvents];
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    
    // Apply importance filter
    if (filters.importance) {
      filtered = filtered.filter(event => event.importance === filters.importance);
    }
    
    // Apply year range filter
    if (filters.startYear) {
      const startYear = parseInt(filters.startYear);
      filtered = filtered.filter(event => {
        const eventYear = parseInt(event.date.split('-')[0]);
        return eventYear >= startYear;
      });
    }
    
    if (filters.endYear) {
      const endYear = parseInt(filters.endYear);
      filtered = filtered.filter(event => {
        const eventYear = parseInt(event.date.split('-')[0]);
        return eventYear <= endYear;
      });
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchLower) || 
        event.description.toLowerCase().includes(searchLower) ||
        // Search by king name
        event.kingIds.some(kingId => {
          const king = kings.find(k => k.id === kingId);
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
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      importance: '',
      startYear: '',
      endYear: '',
      search: ''
    });
  };

  const getRelatedKings = (event) => {
    return kings.filter(king => event.kingIds.includes(king.id));
  };

  const eventTypes = [
    'Religious',
    'Political',
    'Cultural',
    'Economic',
    'Scientific',
    'Diplomatic',
    'Military',
    'Other'
  ];

  const importanceLevels = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
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
        <h1 className="text-3xl font-bold text-dynasty-text">Historical Events</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Filter Events</h2>
          <button
            onClick={clearFilters}
            className="text-dynasty-primary hover:text-dynasty-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
              Importance
            </label>
            <select
              id="importance"
              name="importance"
              value={filters.importance}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Importance</option>
              {importanceLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="yearRange" className="block text-sm font-medium text-gray-700 mb-1">
              Year Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="startYear"
                name="startYear"
                value={filters.startYear}
                onChange={handleFilterChange}
                placeholder="From"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                id="endYear"
                name="endYear"
                value={filters.endYear}
                onChange={handleFilterChange}
                placeholder="To"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search events or rulers"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredEvents.length} events {filters.type || filters.importance || filters.startYear || filters.endYear || filters.search ? 'with applied filters' : ''}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">No events found with the current filters.</p>
          {filters.type || filters.importance || filters.startYear || filters.endYear || filters.search ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              kings={getRelatedKings(event)}
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
