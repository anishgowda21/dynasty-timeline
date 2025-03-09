import { useState, useEffect } from 'react';
import { useDynasty } from '../context/DynastyContext';
import { generateRandomColor } from '../utils/colorUtils';

const AddWarForm = ({ onClose, preselectedKingId = null }) => {
  const { addWar, kings, addOneTimeKing } = useDynasty();
  
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
        (king.dynastyId && kings.find(k => k.id === king.dynastyId)?.name.toLowerCase().includes(query))
      );
      setFilteredKings(filtered);
    }
  }, [kingSearchQuery, kings]);

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
          kings.find(k => k.id === selectedKing.dynastyId)?.name : null
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
            placeholder="e.g., 1337"
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
            placeholder="e.g., 1453"
          />
          {errors.endYear && <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type of Conflict
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Type</option>
            {warTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
            Historical Importance
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
          placeholder="Describe the war, its causes, and outcomes..."
        ></textarea>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium mb-2">Participants</h3>
        
        {formData.participants.length > 0 ? (
          <div className="mb-4 space-y-2">
            {formData.participants.map((p, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{p.name}</span>
                  {p.dynastyName && <span className="text-sm text-gray-600 ml-1">({p.dynastyName})</span>}
                  <span className="text-sm ml-2 px-2 py-0.5 bg-gray-200 rounded-full">{p.role}</span>
                  {p.side && <span className="text-sm text-gray-600 ml-2">Side: {p.side}</span>}
                </div>
                <button 
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm mb-2 ${errors.participants ? 'text-red-500' : 'text-gray-500'}`}>
            No participants added yet. Add at least one participant.
          </p>
        )}
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="mb-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOneTime"
                name="isOneTime"
                checked={participant.isOneTime}
                onChange={handleParticipantChange}
                className="h-4 w-4 text-dynasty-primary border-gray-300 rounded"
              />
              <label htmlFor="isOneTime" className="ml-2 block text-sm text-gray-700">
                Add a one-time ruler (not in the database)
              </label>
            </div>
          </div>
          
          {participant.isOneTime ? (
            <>
              <div className="mb-3">
                <label htmlFor="newKingName" className="block text-sm font-medium text-gray-700 mb-1">
                  Ruler Name
                </label>
                <input
                  type="text"
                  id="newKingName"
                  name="newKingName"
                  value={participant.newKingName}
                  onChange={handleParticipantChange}
                  className={`w-full p-2 border rounded-md ${errors.participant_newKingName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Attila the Hun"
                />
                {errors.participant_newKingName && (
                  <p className="text-red-500 text-xs mt-1">{errors.participant_newKingName}</p>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="newKingDynastyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Dynasty Name (Optional)
                </label>
                <input
                  type="text"
                  id="newKingDynastyName"
                  name="newKingDynastyName"
                  value={participant.newKingDynastyName}
                  onChange={handleParticipantChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Hun Empire"
                />
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label htmlFor="kingSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Search Rulers
              </label>
              <input
                type="text"
                id="kingSearch"
                value={kingSearchQuery}
                onChange={handleSearchChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Search by ruler or dynasty name..."
              />
              
              <select
                id="kingId"
                name="kingId"
                value={participant.kingId}
                onChange={handleParticipantChange}
                className={`w-full p-2 border rounded-md ${errors.participant_kingId ? 'border-red-500' : 'border-gray-300'}`}
                size={5}
              >
                <option value="">Select a Ruler</option>
                {filteredKings.map(king => {
                  const dynastyName = king.dynastyId ? 
                    dynasties.find(d => d.id === king.dynastyId)?.name : 
                    (king.isOneTime ? "One-time ruler" : "Unknown dynasty");
                  
                  return (
                    <option key={king.id} value={king.id}>
                      {king.name} ({dynastyName}) {king.startYear}-{king.endYear || 'Unknown'}
                    </option>
                  );
                })}
              </select>
              {errors.participant_kingId && (
                <p className="text-red-500 text-xs mt-1">{errors.participant_kingId}</p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role in Conflict
              </label>
              <select
                id="role"
                name="role"
                value={participant.role}
                onChange={handleParticipantChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {participantRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="side" className="block text-sm font-medium text-gray-700 mb-1">
                Side/Faction (Optional)
              </label>
              <input
                type="text"
                id="side"
                name="side"
                value={participant.side}
                onChange={handleParticipantChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Allies, Central Powers"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={participant.notes}
              onChange={handleParticipantChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Led naval forces, Negotiated peace treaty"
            />
          </div>
          
          <button
            type="button"
            onClick={addParticipant}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
          >
            Add Participant
          </button>
        </div>
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
          Add War/Conflict
        </button>
      </div>
    </form>
  );
};

export default AddWarForm;
