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
            onChange={handleChange