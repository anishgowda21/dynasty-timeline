import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import { generateRandomColor } from '../utils/colorUtils';

const AddWarForm = ({ onClose, preselectedKingId = null }) => {
  const { addWar, kings, dynasties, addOneTimeKing } = useDynasty();
  
  const [formData, setFormData] = useState({
    name: '',
    startYear: '',
    endYear: '',
    description: '',
    participants: [],
    location: '',
    type: '',
    importance: 'medium'
  });
  
  const [participant, setParticipant] = useState({
    kingId: preselectedKingId || '',
    role: 'participant',
    side: '',
    notes: '',
    // Fields for creating one-time kings
    isOneTime: false,
    newKingName: '',
    newKingDynastyName: ''
  });
  
  const [errors, setErrors] = useState({});
  const [kingSearchQuery, setKingSearchQuery] = useState('');
  const [filteredKings, setFilteredKings] = useState([]);
  
  useEffect(() => {
    if (kingSearchQuery.trim() === '') {
      setFilteredKings(kings);
    } else {
      const query = kingSearchQuery.toLowerCase();
      const filtered = kings.filter(king => 
        king.name.toLowerCase().includes(query) || 
        (king.dynastyId && dynasties.find(d => d.id === king.dynastyId)?.name.toLowerCase().includes(query))
      );
      setFilteredKings(filtered);
    }
  }, [kingSearchQuery, kings, dynasties]);

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
    const { name, value, type, checked } = e.target;
    setParticipant({
      ...participant,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is modified
    if (errors[`participant_${name}`]) {
      setErrors({
        ...errors,
        [`participant_${name}`]: null
      });
    }
  };
  
  const handleSearchChange = (e) => {
    setKingSearchQuery(e.target.value);
  };
  
  const addParticipant = () => {
    // Validate participant
    const participantErrors = {};
    
    if (!participant.isOneTime && !participant.kingId) {
      participantErrors.participant_kingId = 'Please select a ruler or add a one-time ruler';
    }
    
    if (participant.isOneTime && !participant.newKingName.trim()) {
      participantErrors.participant_newKingName = 'Ruler name is required';
    }
    
    if (Object.keys(participantErrors).length > 0) {
      setErrors({
        ...errors,
        ...participantErrors
      });
      return;
    }
    
    // If creating a one-time king
    if (participant.isOneTime) {
      // Create a one-time king
      const oneTimeKing = addOneTimeKing({
        name: participant.newKingName,
        dynastyName: participant.newKingDynastyName || null,
        color: generateRandomColor()
      });
      
      // Add to participants
      const newParticipant = {
        kingId: oneTimeKing.id,
        role: participant.role,
        side: participant.side,
        notes: participant.notes,
        name: participant.newKingName, // Keep original name for reference
        dynastyName: participant.newKingDynastyName || null
      };
      
      setFormData({
        ...formData,
        participants: [...formData.participants, newParticipant]
      });
    } else {
      // Get the king's info
      const selectedKing = kings.find(k => k.id === participant.kingId);
      
      // Add to participants
      const newParticipant = {
        kingId: participant.kingId,
        role: participant.role,
        side: participant.side,
        notes: participant.notes,
        name: selectedKing.name, // For display purposes
        dynastyId: selectedKing.dynastyId,
        dynastyName: selectedKing.dynastyId ? 
          dynasties.find(d => d.id === selectedKing.dynastyId)?.name : null
      };
      
      setFormData({
        ...formData,
        participants: [...formData.participants, newParticipant]
      });
    }
    
    // Reset participant form
    setParticipant({
      kingId: '',
      role: 'participant',
      side: '',
      notes: '',
      isOneTime: false,
      newKingName: '',
      newKingDynastyName: ''
    });
    
    setKingSearchQuery('');
  };
  
  const removeParticipant = (index) => {
    const updatedParticipants = [...formData.participants];
    updatedParticipants.splice(index, 1);
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
    
    if (!formData.startYear) {
      newErrors.startYear = 'Start year is required';
    } else if (isNaN(parseInt(formData.startYear))) {
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const warData = {
      ...formData,
      startYear: parseInt(formData.startYear),
    };
    
    // Only include end year if provided
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
            <option value="">Select War Type</option>
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
            Start Year
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
            End Year
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
      
      <div className="border-t border-gray-300 pt-4 mt-6">
        <h3 className="text-lg font-medium mb-2">Participants</h3>
        
        {errors.participants && (
          <p className="text-red-500 text-xs mb-2">{errors.participants}</p>
        )}
        
        <div className="bg-gray-50 p-3 rounded-md mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isOneTime"
                  name="isOneTime"
                  checked={participant.isOneTime}
                  onChange={handleParticipantChange}
                  className="mr-2"
                />
                <label htmlFor="isOneTime" className="text-sm">
                  Add One-time Ruler (not in database)
                </label>
              </div>
              
              {participant.isOneTime ? (
                <>
                  <div className="mb-2">
                    <input
                      type="text"
                      name="newKingName"
                      value={participant.newKingName}
                      onChange={handleParticipantChange}
                      placeholder="Ruler name"
                      className={`w-full p-2 border rounded-md ${
                        errors.participant_newKingName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.participant_newKingName && (
                      <p className="text-red-500 text-xs mt-1">{errors.participant_newKingName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="newKingDynastyName"
                      value={participant.newKingDynastyName}
                      onChange={handleParticipantChange}
                      placeholder="Dynasty (optional)"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Search rulers..."
                    value={kingSearchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-md mb-1"
                  />
                  <select
                    name="kingId"
                    value={participant.kingId}
                    onChange={handleParticipantChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.participant_kingId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a ruler</option>
                    {filteredKings.map(king => (
                      <option key={king.id} value={king.id}>
                        {king.name} {king.dynastyId ? `(${dynasties.find(d => d.id === king.dynastyId)?.name})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.participant_kingId && (
                    <p className="text-red-500 text-xs mt-1">{errors.participant_kingId}</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-2">
                <label className="block text-sm mb-1">Role</label>
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
              
              <div className="mb-2">
                <label className="block text-sm mb-1">Side (optional)</label>
                <input
                  type="text"
                  name="side"
                  value={participant.side}
                  onChange={handleParticipantChange}
                  placeholder="e.g., Allied Powers, Axis"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Notes (optional)</label>
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
          </div>
          
          <button
            type="button"
            onClick={addParticipant}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Participant
          </button>
        </div>
        
        {formData.participants.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Added Participants:</h4>
            <ul className="space-y-2">
              {formData.participants.map((p, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.dynastyName && <span className="text-gray-600"> ({p.dynastyName})</span>}
                    <span className="text-gray-500 ml-2">• {p.role}</span>
                    {p.side && <span className="text-gray-500"> • {p.side}</span>}
                    {p.notes && <span className="text-gray-500 italic ml-1"> - {p.notes}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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