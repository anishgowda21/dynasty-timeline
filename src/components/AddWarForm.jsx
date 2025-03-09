import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import { generateRandomColor } from '../utils/colorUtils';

const AddWarForm = ({ onClose, preselectedKingId = null }) => {
  const { addWar, kings, dynasties, addOneTimeKing } = useDynasty();
  
  // Initialize with preselected king if available
  const [formData, setFormData] = useState({
    name: '',
    startYear: '',
    endYear: '',
    description: '',
    participants: [],
    location: '',
    type: 'Conquest', // Set Conquest as default war type
    importance: 'medium'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKings, setFilteredKings] = useState([]);
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [participant, setParticipant] = useState({
    role: 'participant',
    notes: '',
  });
  
  const [oneTimeKing, setOneTimeKing] = useState({
    name: '',
    dynastyName: '',
  });
  
  const [errors, setErrors] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  // Initialize selectedParticipants from preselected king if provided
  useEffect(() => {
    if (preselectedKingId) {
      const king = kings.find(k => k.id === preselectedKingId);
      if (king) {
        const preselectedParticipant = {
          kingId: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName: king.dynastyId 
            ? dynasties.find(d => d.id === king.dynastyId)?.name 
            : null,
          role: 'participant', // Default role, but can be changed by user
          notes: '',
          isPreselected: true
        };
        
        setSelectedParticipants([preselectedParticipant]);
        setFormData({
          ...formData,
          participants: [preselectedParticipant]
        });
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
        !selectedParticipants.some(p => p.kingId === king.id) && (
          king.name.toLowerCase().includes(query) || 
          (king.dynastyId && dynasties.find(d => d.id === king.dynastyId)?.name.toLowerCase().includes(query))
        )
      );
      setFilteredKings(filtered);
    }
  }, [searchQuery, kings, dynasties, selectedParticipants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipant({
      ...participant,
      [name]: value
    });
  };
  
  // Update role for a specific participant
  const updateParticipantRole = (index, newRole) => {
    const updatedParticipants = [...selectedParticipants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      role: newRole
    };
    
    setSelectedParticipants(updatedParticipants);
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
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
  
  const handleShowAddOneTime = () => {
    // Auto-fill name from search query if available
    if (searchQuery.trim() !== '') {
      setOneTimeKing({
        ...oneTimeKing,
        name: searchQuery
      });
    }
    setShowAddOneTime(true);
  };
  
  const addOneTimeKingToParticipants = () => {
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
    
    // Create new participant
    const newParticipant = {
      kingId: tempId,
      name: oneTimeKing.name,
      dynastyName: oneTimeKing.dynastyName || null,
      isOneTime: true,
      role: participant.role,
      notes: participant.notes
    };
    
    // Add to participants
    const updatedParticipants = [...selectedParticipants, newParticipant];
    setSelectedParticipants(updatedParticipants);
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
    
    // Reset forms
    setOneTimeKing({
      name: '',
      dynastyName: ''
    });
    setShowAddOneTime(false);
    setParticipant({
      role: 'participant',
      notes: '',
    });
  };
  
  const addKingFromSearch = (king) => {
    const dynastyName = king.dynastyId 
      ? dynasties.find(d => d.id === king.dynastyId)?.name 
      : null;
    
    // Create new participant
    const newParticipant = {
      kingId: king.id,
      name: king.name,
      dynastyId: king.dynastyId,
      dynastyName,
      role: participant.role,
      notes: participant.notes
    };
    
    // Add to participants
    const updatedParticipants = [...selectedParticipants, newParticipant];
    setSelectedParticipants(updatedParticipants);
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
    
    // Reset search and participant form
    setSearchQuery('');
    setParticipant({
      role: 'participant',
      notes: '',
    });
  };
  
  const removeParticipant = (index) => {
    // Don't allow removal of preselected kings (from ruler page)
    if (selectedParticipants[index].isPreselected) {
      return;
    }
    
    const updatedParticipants = [...selectedParticipants];
    updatedParticipants.splice(index, 1);
    setSelectedParticipants(updatedParticipants);
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'War name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Please select a war type';
    }
    
    // Start year is not mandatory, but if provided must be a number
    if (formData.startYear && isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = 'Start year must be a number';
    }
    
    if (formData.endYear && isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = 'End year must be a number';
    }
    
    if (formData.startYear && formData.endYear && 
        parseInt(formData.startYear) > parseInt(formData.endYear)) {
      newErrors.endYear = 'End year must be after start year';
    }
    
    if (formData.participants.length < 1) {
      newErrors.participants = 'At least one participant must be added';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Process one-time kings if any
    const kingIdsMap = new Map();
    for (const participant of selectedParticipants) {
      if (participant.isOneTime) {
        // Create real one-time king
        const newKing = await addOneTimeKing({
          name: participant.name,
          dynastyName: participant.dynastyName,
          color: generateRandomColor()
        });
        kingIdsMap.set(participant.kingId, newKing.id);
      } else {
        kingIdsMap.set(participant.kingId, participant.kingId);
      }
    }
    
    // Replace temporary IDs with real ones and prepare final participants list
    const finalParticipants = selectedParticipants.map(p => ({
      kingId: kingIdsMap.has(p.kingId) ? kingIdsMap.get(p.kingId) : p.kingId,
      role: p.role,
      notes: p.notes,
      name: p.name,
      dynastyName: p.dynastyName,
      dynastyId: p.dynastyId
    }));
    
    // Create war data
    const warData = {
      ...formData,
      participants: finalParticipants
    };
    
    // Only include years if provided
    if (formData.startYear) {
      warData.startYear = parseInt(formData.startYear);
    }
    
    if (formData.endYear) {
      warData.endYear = parseInt(formData.endYear);
    }
    
    addWar(warData);
    
    if (onClose) onClose();
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
  
  const participantRoles = [
    { value: 'victor', label: 'Victor' },
    { value: 'defeated', label: 'Defeated' },
    { value: 'participant', label: 'Participant' },
    { value: 'ally', label: 'Ally' },
    { value: 'neutral', label: 'Neutral Observer' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">Add New War/Conflict</div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          War/Conflict Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="e.g., Hundred Years' War, First Punic War"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            War Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
          >
            {warTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year (Optional)
          </label>
          <input
            type="number"
            id="startYear"
            name="startYear"
            value={formData.startYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.startYear ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.startYear && <p className="text-red-500 text-xs mt-1">{errors.startYear}</p>}
        </div>
        
        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year (Optional)
          </label>
          <input
            type="number"
            id="endYear"
            name="endYear"
            value={formData.endYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.endYear ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.endYear && <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g., Western Europe, Mediterranean"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Brief description of the war/conflict"
        />
      </div>
      
      {/* Participants Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">
            Participants
          </h3>
        </div>
        
        {/* Selected Participants */}
        <div className="mb-4">
          {selectedParticipants.length > 0 ? (
            <div className="space-y-2 mb-3">
              {selectedParticipants.map((participant, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
                    <div className="flex-grow">
                      <span className="font-medium">{participant.name}</span>
                      {participant.dynastyName && (
                        <span className="text-gray-600"> ({participant.dynastyName})</span>
                      )}
                      {participant.isOneTime && (
                        <span className="text-gray-500 ml-1">(One-time)</span>
                      )}
                      {participant.notes && (
                        <span className="text-gray-500 italic ml-1 block sm:inline sm:ml-2">
                          Note: {participant.notes}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 sm:mt-0 sm:ml-4">
                      <select
                        value={participant.role}
                        onChange={(e) => updateParticipantRole(index, e.target.value)}
                        className="p-1 text-sm border border-gray-300 rounded-md bg-white"
                      >
                        {participantRoles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className={`ml-2 ${participant.isPreselected ? 'hidden' : 'text-red-500 hover:text-red-700'}`}
                    disabled={participant.isPreselected}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm mb-3 ${errors.participants ? 'text-red-500' : 'text-gray-500'}`}>
              No participants added yet.
            </p>
          )}
          {errors.participants && <p className="text-red-500 text-xs">{errors.participants}</p>}
        </div>
        
        {/* Add new participant */}
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
              onClick={handleShowAddOneTime}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Add One-time
            </button>
          </div>
          
          {/* Participant Role and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={participant.role}
                onChange={handleParticipantChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {participantRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                name="notes"
                value={participant.notes}
                onChange={handleParticipantChange}
                placeholder="Additional information"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
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
                  onClick={addOneTimeKingToParticipants}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save War/Conflict
        </button>
      </div>
    </form>
  );
};

export default AddWarForm;