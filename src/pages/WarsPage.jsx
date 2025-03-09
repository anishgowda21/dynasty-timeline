import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import WarCard from '../components/WarCard';
import Modal from '../components/Modal';
import AddEventForm from '../components/AddEventForm';

const WarsPage = () => {
  const { events, kings, dynasties, loading } = useDynasty();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredWars, setFilteredWars] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    importance: '',
    startYear: '',
    endYear: '',
    search: '',
    participant: ''
  });

  useEffect(() => {
    // Get all war events
    const warEvents = events.filter(event => event.type === 'War' || event.isWar);
    
    let filtered = [...warEvents];
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(war => war.type === filters.type);
    }
    
    // Apply importance filter
    if (filters.importance) {
      filtered = filtered.filter(war => war.importance === filters.importance);
    }
    
    // Apply year range filter
    if (filters.startYear) {
      const startYear = parseInt(filters.startYear);
      filtered = filtered.filter(war => {
        const warStartYear = parseInt(war.date.split('-')[0]);
        return warStartYear >= startYear;
      });
    }
    
    if (filters.endYear) {
      const endYear = parseInt(filters.endYear);
      filtered = filtered.filter(war => {
        // Use end date if available, otherwise use start date
        const warEndYear = war.endDate 
          ? parseInt(war.endDate.split('-')[0])
          : parseInt(war.date.split('-')[0]);
        return warEndYear <= endYear;
      });
    }
    
    // Apply participant filter (king or dynasty)
    if (filters.participant) {
      const participantLower = filters.participant.toLowerCase();
      filtered = filtered.filter(war => {
        // Check if any king involved in the war matches the search
        const matchesKing = war.kingIds && war.kingIds.some(kingId => {
          const king = kings.find(k => k.id === kingId);
          return king && king.name.toLowerCase().includes(participantLower);
        });
        
        // Check if any participant matches the search (for wars with participant data)
        const matchesParticipant = war.participants && war.participants.some(p => {
          if (p.name && p.name.toLowerCase().includes(participantLower)) {
            return true;
          }
          if (p.dynastyName && p.dynastyName.toLowerCase().includes(participantLower)) {
            return true;
          }
          if (p.kingId) {
            const king = kings.find(k => k.id === p.kingId);
            if (king && king.name.toLowerCase().includes(participantLower)) {
              return true;
            }
            if (king && king.dynastyId) {
              const dynasty = dynasties.find(d => d.id === king.dynastyId);
              return dynasty && dynasty.name.toLowerCase().includes(participantLower);
            }
          }
          return false;
        });
        
        return matchesKing || matchesParticipant;
      });
    }
    
    // Apply search filter (general search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(war => 
        war.name.toLowerCase().includes(searchLower) || 
        (war.description && war.description.toLowerCase().includes(searchLower)) ||
        (war.location && war.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    setFilteredWars(filtered);
  }, [events, kings, dynasties, filters]);

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
      search: '',
      participant: ''
    });
  };

  const warTypes = [
    'Conquest',
    'Civil War',
    'Succession',
    'Religious',
    'Trade',
    'Naval',
    'Colonial',
    'Territorial',
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
        <h1 className="text-3xl font-bold text-dynasty-text">Wars & Conflicts</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add War/Conflict
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Filter Wars</h2>
          <button
            onClick={clearFilters}
            className="text-dynasty-primary hover:text-dynasty-secondary text-sm"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              War Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              {warTypes.map(type => (
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="participant" className="block text-sm font-medium text-gray-700 mb-1">
              Participant (Ruler or Dynasty)
            </label>
            <input
              type="text"
              id="participant"
              name="participant"
              value={filters.participant}
              onChange={handleFilterChange}
              placeholder="Search for ruler or dynasty"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              General Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search war name, description, location"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredWars.length} wars/conflicts {Object.values(filters).some(v => v) ? 'with applied filters' : ''}
        </p>
      </div>

      {filteredWars.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">No wars or conflicts found with the current filters.</p>
          {Object.values(filters).some(v => v) ? (
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
              Add Your First War/Conflict
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWars.map(war => (
            <WarCard key={war.id} war={war} />
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddEventForm 
          onClose={() => setShowAddModal(false)} 
          initialIsWar={true}
        />
      </Modal>
    </div>
  );
};

export default WarsPage;
