import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import { generateRandomColor } from '../utils/colorUtils';

const AddEventForm = ({ onClose, preselectedKingId = null, initialIsWar = false }) => {
  const { addEvent, kings, dynasties, addOneTimeKing } = useDynasty();
  
  const initialSelectedKingIds = preselectedKingId ? [preselectedKingId] : [];
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    kingIds: initialSelectedKingIds,
    type: '',
    importance: 'medium',
    // War-specific fields
    isWar: initialIsWar,
    location: '',
    endDate: '',
    participants: []
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKings, setFilteredKings] = useState([]);
  const [selectedKings, setSelectedKings] = useState([]);
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [oneTimeKing, setOneTimeKing] = useState({
    name: '',
    dynastyName: '',
  });
  
  const [errors, setErrors] = useState({});
  
  // Initialize selected kings from preselected ID
  useEffect(() => {
    if (preselectedKingId) {
      const king = kings.find(k => k.id === preselectedKingId);
      if (king) {
        setSelectedKings([{
          id: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName: king.dynastyId 
            ? dynasties.find(d => d.id === king.dynastyId)?.name 
            : null
        }]);
      }
    }
  }, [preselectedKingId, kings, dynasties]);
  
  // Filter kings based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredKings(kings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = kings.filter(king => 
        !formData.kingIds.includes(king.id) && (
          king.name.toLowerCase().includes(query) || 
          (king.dynastyId && dynasties.find(d => d.id === king.dynastyId)?.name.toLowerCase().includes(query))
        )
      );
      setFilteredKings(filtered);
    }
  }, [searchQuery, kings, dynasties, formData.kingIds]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleOneTimeChange = (e) => {
    const { name, value } = e.target;
    setOneTimeKing({
      ...oneTimeKing,
      [name]: value
    });
    
    // Clear error
    if (errors[`oneTime_${name}`]) {
      setErrors({
        ...errors,
        [`oneTime_${name}`]: null
      });
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const addOneTimeKingToSelection = () => {
    // Validate
    if (!oneTimeKing.name.trim()) {
      setErrors({
        ...errors,
        oneTime_name: 'Ruler name is required'
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
      isOneTime: true
    };
    
    setSelectedKings([...selectedKings, newKing]);
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, tempId]
    });
    
    // Reset form
    setOneTimeKing({
      name: '',
      dynastyName: ''
    });
    setShowAddOneTime(false);
  };
  
  const addKingFromSearch = (king) => {
    const dynastyName = king.dynastyId 
      ? dynasties.find(d => d.id === king.dynastyId)?.name 
      : null;
    
    const newSelectedKing = {
      id: king.id,
      name: king.name,
      dynastyId: king.dynastyId,
      dynastyName
    };
    
    setSelectedKings([...selectedKings, newSelectedKing]);
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, king.id]
    });
    
    setSearchQuery('');
  };
  
  const removeKing = (kingId) => {
    setSelectedKings(selectedKings.filter(king => king.id !== kingId));
    setFormData({
      ...formData,
      kingIds: formData.kingIds.filter(id => id !== kingId)
    });
  };
  
  const addParticipant = (king, role = 'participant') => {
    // Check if already a participant
    const alreadyParticipant = formData.participants.some(
      p => p.kingId === king.id
    );
    
    if (alreadyParticipant) {
      return;
    }
    
    const newParticipant = {
      kingId: king.id,
      name: king.name,
      dynastyName: king.dynastyName,
      role,
      side: '',
      notes: ''
    };
    
    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant]
    });
  };
  
  const updateParticipant = (kingId, field, value) => {
    setFormData({
      ...formData,
      participants: formData.participants.map(p => 
        p.kingId === kingId ? { ...p, [field]: value } : p
      )
    });
  };
  
  const removeParticipant = (kingId) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.kingId !== kingId)
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    
    if (formData.isWar) {
      // Validate war-specific fields
      if (formData.participants.length < 2) {
        newErrors.participants = 'A war needs at least two participants';
      }
      
      if (formData.endDate && formData.date) {
        const startYear = parseInt(formData.date.split('-')[0]);
        const endYear = parseInt(formData.endDate.split('-')[0]);
        
        if (endYear < startYear) {
          newErrors.endDate = 'End date must be after start date';
        }
      }
    } else {
      // Validate regular event
      if (formData.kingIds.length === 0) {
        newErrors.kingIds = 'At least one ruler must be selected';
      }
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
          color: generateRandomColor()
        });
        kingIdsMap.set(king.id, newKing.id);
      } else {
        kingIdsMap.set(king.id, king.id);
      }
    }
    
    // Replace temporary IDs with real ones
    const finalKingIds = formData.kingIds.map(id => 
      kingIdsMap.has(id) ? kingIdsMap.get(id) : id
    );
    
    // Create event data
    let eventData = {
      name: formData.name,
      date: formData.date,
      description: formData.description,
      type: formData.isWar ? 'War' : formData.type,
      importance: formData.importance,
    };
    
    if (formData.isWar) {
      // Create war event with participants
      eventData = {
        ...eventData,
        kingIds: finalKingIds,
        location: formData.location,
        endDate: formData.endDate,
        participants: formData.participants.map(p => ({
          ...p,
          kingId: kingIdsMap.has(p.kingId) ? kingIdsMap.get(p.kingId) : p.kingId
        })),
        isWar: true
      };
    } else {
      // Regular event
      eventData = {
        ...eventData,
        kingIds: finalKingIds
      };
    }
    
    addEvent(eventData);
    
    if (onClose) onClose();
  };
  
  const eventTypes = [
    'Battle',
    'Religious',
    'Political',
    'Cultural',
    'Economic',
    'Scientific',
    'Diplomatic',
    'Other'
  ];
  
  const warTypes = [
    'Conquest',
    'Civil War',
    'Succession',
    'Religious',
    'Trade',
    'Naval',
    'Colonial',
    'Territorial'
  ];
  
  const importanceLevels = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];
  
  const participantRoles = [
    { value: 'victor', label: 'Victor' },
    { value: 'defeated', label: 'Defeated' },
    { value: 'participant', label: 'Participant' },
    { value: 'ally', label: 'Ally' },
    { value: 'neutral', label: 'Neutral Observer' }
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">
        Add New {formData.isWar ? 'War/Conflict' : 'Historical Event'}
      </div>
      
      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isWar"
            checked={formData.isWar}
            onChange={handleChange}
            className="h-4 w-4 text-dynasty-primary border-gray-300 rounded"
          />
          <span className="ml-2">This is a war/conflict</span>
        </label>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {formData.isWar ? 'War/Conflict Name' : 'Event Name'}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={formData.isWar ? "e.g., Hundred Years' War" : "e.g., Signing of Magna Carta"}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            {formData.isWar ? 'Start Date' : 'Date'}
          </label>
          <input
            type="text"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="YYYY-MM-DD or just YYYY"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          <p className="text-xs text-gray-500 mt-1">You can use YYYY-MM-DD format or just the year (YYYY)</p>
        </div>
        
        {formData.isWar && (
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="text"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="YYYY-MM-DD or just YYYY"
            />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={formData.isWar}
          >
            <option value="">Select Type</option>
            {(formData.isWar ? warTypes : eventTypes).map(type => (
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
            value={formData.importance}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {importanceLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {formData.isWar && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location (Optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Northern France, Mediterranean Sea"
          />
        </div>
      )}
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={formData.isWar ? "Describe the conflict, its causes, and outcomes..." : "Describe the historical event..."}
        ></textarea>
      </div>
      
      {/* Kings/Rulers Selection Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">
            {formData.isWar ? 'Participants' : 'Related Rulers'}
          </h3>
          {formData.isWar && (
            <p className="text-sm text-gray-500">
              Add at least two participants for a war/conflict
            </p>
          )}
        </div>
        
        {/* Selected Kings Pills */}
        <div className="mb-4">
          {selectedKings.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedKings.map(king => (
                <div 
                  key={king.id}
                  className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  <span>{king.name}</span>
                  {king.dynastyName && (
                    <span className="text-gray-500 ml-1">({king.dynastyName})</span>
                  )}
                  {king.isOneTime && (
                    <span className="text-gray-500 ml-1">(One-time)</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeKing(king.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm mb-3 ${errors.kingIds ? 'text-red-500' : 'text-gray-500'}`}>
              No rulers selected yet.
            </p>
          )}
          {errors.kingIds && <p className="text-red-500 text-xs">{errors.kingIds}</p>}
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
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddOneTime(true)}
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
                  No matching rulers found
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
                    className={`w-full p-2 border ${errors.oneTime_name ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                  />
                  {errors.oneTime_name && <p className="text-red-500 text-xs mt-1">{errors.oneTime_name}</p>}
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
        
        {/* War Participants Roles (Only shown for wars) */}
        {formData.isWar && selectedKings.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Participant Details</h4>
            
            {formData.participants.length > 0 ? (
              <div className="space-y-3">
                {formData.participants.map(participant => {
                  const king = selectedKings.find(k => k.id === participant.kingId);
                  
                  return (
                    <div key={participant.kingId} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{king?.name}</span>
                          {king?.dynastyName && (
                            <span className="text-gray-500 text-sm ml-1">({king.dynastyName})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeParticipant(participant.kingId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Role</label>
                          <select
                            value={participant.role}
                            onChange={(e) => updateParticipant(participant.kingId, 'role', e.target.value)}
                            className="w-full p-1 text-sm border border-gray-300 rounded-md"
                          >
                            {participantRoles.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Side/Faction (Optional)</label>
                          <input
                            type="text"
                            value={participant.side}
                            onChange={(e) => updateParticipant(participant.kingId, 'side', e.target.value)}
                            placeholder="e.g., Allies, Central Powers"
                            className="w-full p-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Notes (Optional)</label>
                        <input
                          type="text"
                          value={participant.notes}
                          onChange={(e) => updateParticipant(participant.kingId, 'notes', e.target.value)}
                          placeholder="e.g., Led naval forces, Negotiated peace treaty"
                          className="w-full p-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  No participant details added yet. Please add details for each participant.
                </p>
                <div className="space-y-2">
                  {selectedKings.map(king => (
                    <div key={king.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                      <div>
                        <span className="font-medium">{king.name}</span>
                        {king.dynastyName && (
                          <span className="text-gray-500 text-sm ml-1">({king.dynastyName})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addParticipant(king)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errors.participants && (
              <p className="text-red-500 text-xs mt-1">{errors.participants}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Add {formData.isWar ? 'War/Conflict' : 'Event'}
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
