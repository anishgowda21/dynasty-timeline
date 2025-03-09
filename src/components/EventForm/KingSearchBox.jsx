import { useState, useEffect, useRef } from 'react';
import { useDynasty } from '../../context/DynastyContext';

const KingSearchBox = ({ 
  selectedKings, 
  onKingSelect, 
  onKingRemove, 
  excludeKingIds = [], 
  error = null,
  preselectedKingId = null
}) => {
  const { kings, dynasties } = useDynasty();
  const searchInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKings, setFilteredKings] = useState([]);
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [oneTimeKing, setOneTimeKing] = useState({
    name: '',
    dynastyName: '',
  });
  
  const [validationError, setValidationError] = useState(null);
  
  // Filter kings based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredKings(kings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = kings.filter(king => 
        !excludeKingIds.includes(king.id) && (
          king.name.toLowerCase().includes(query) || 
          (king.dynastyId && dynasties.find(d => d.id === king.dynastyId)?.name.toLowerCase().includes(query))
        )
      );
      setFilteredKings(filtered);
    }
  }, [searchQuery, kings, dynasties, excludeKingIds]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleAddOneTimeClick = () => {
    setShowAddOneTime(true);
    // Auto-fill from search query if available
    if (searchQuery.trim() !== '') {
      setOneTimeKing({
        ...oneTimeKing,
        name: searchQuery.trim()
      });
    }
  };
  
  const handleOneTimeChange = (e) => {
    const { name, value } = e.target;
    setOneTimeKing({
      ...oneTimeKing,
      [name]: value
    });
    
    // Clear validation error
    if (validationError) {
      setValidationError(null);
    }
  };
  
  const addOneTimeKingToSelection = () => {
    // Validate
    if (!oneTimeKing.name.trim()) {
      setValidationError('Ruler name is required');
      return;
    }
    
    // Create a temporary ID for the one-time king
    const tempId = `temp_${Date.now()}`;
    
    // Create new king object
    const newKing = {
      id: tempId,
      name: oneTimeKing.name,
      dynastyName: oneTimeKing.dynastyName || null,
      isOneTime: true
    };
    
    // Call parent handler
    onKingSelect(newKing);
    
    // Reset form
    setOneTimeKing({
      name: '',
      dynastyName: ''
    });
    setShowAddOneTime(false);
    setSearchQuery('');
  };
  
  const addKingFromSearch = (king) => {
    const dynastyName = king.dynastyId 
      ? dynasties.find(d => d.id === king.dynastyId)?.name 
      : null;
    
    const kingWithDynasty = {
      ...king,
      dynastyName
    };
    
    onKingSelect(kingWithDynasty);
    setSearchQuery('');
  };

  return (
    <div className="mb-4">
      {/* Selected Kings Pills */}
      <div className="mb-4">
        {selectedKings.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedKings.map(king => (
              <div 
                key={king.id}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                  king.id === preselectedKingId ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <span>{king.name}</span>
                {king.dynastyName && (
                  <span className="text-gray-500 ml-1">({king.dynastyName})</span>
                )}
                {king.isOneTime && (
                  <span className="text-gray-500 ml-1">(One-time)</span>
                )}
                {king.id !== preselectedKingId && (
                  <button
                    type="button"
                    onClick={() => onKingRemove(king.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm mb-3 ${error ? 'text-red-500' : 'text-gray-500'}`}>
            No rulers selected yet.
          </p>
        )}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
      
      {/* King Search and Add */}
      <div className="flex space-x-2 mb-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search for rulers..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            ref={searchInputRef}
          />
        </div>
        <button
          type="button"
          onClick={handleAddOneTimeClick}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Add One-time
        </button>
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md mb-3">
          {filteredKings.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredKings.map(king => {
                const dynastyName = king.dynastyId 
                  ? dynasties.find(d => d.id === king.dynastyId)?.name 
                  : 'No dynasty';
                
                return (
                  <li 
                    key={king.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addKingFromSearch(king)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{king.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({dynastyName})</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {king.startYear}{king.endYear ? `-${king.endYear}` : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500">
              No matching rulers found.
              <button
                type="button"
                onClick={handleAddOneTimeClick}
                className="ml-2 text-dynasty-primary hover:underline"
              >
                Add as one-time ruler
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Add One-time King Form */}
      {showAddOneTime && (
        <div className="border border-gray-300 rounded-md p-3 mb-3 bg-gray-50">
          <div className="text-sm font-medium mb-2">Add a one-time ruler</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="name"
                value={oneTimeKing.name}
                onChange={handleOneTimeChange}
                placeholder="Ruler name *"
                className={`w-full p-2 border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
              />
              {validationError && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
            </div>
            <div>
              <input
                type="text"
                name="dynastyName"
                value={oneTimeKing.dynastyName}
                onChange={handleOneTimeChange}
                placeholder="Dynasty name (optional)"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddOneTime(false)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
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
};

export default KingSearchBox;
