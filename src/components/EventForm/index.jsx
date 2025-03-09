import { useState, useEffect } from 'react';
import { useDynasty } from '../../context/DynastyContext';
import { generateRandomColor } from '../../utils/colorUtils';
import KingSearchBox from './KingSearchBox';
import WarParticipantsEditor from './WarParticipantsEditor';
import EventBasicInfo from './EventBasicInfo';
import Notification from '../Notification';

const EventForm = ({ onClose, preselectedKingId = null, initialIsWar = false }) => {
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
    warType: '',
    participants: []
  });
  
  const [selectedKings, setSelectedKings] = useState([]);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [notification, setNotification] = useState(null);
  
  // Initialize selected kings from preselected ID
  useEffect(() => {
    if (preselectedKingId) {
      const king = kings.find(k => k.id === preselectedKingId);
      if (king) {
        const dynastyName = king.dynastyId 
          ? dynasties.find(d => d.id === king.dynastyId)?.name 
          : null;
          
        setSelectedKings([{
          id: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName,
          isPreselected: true // Mark as preselected to prevent removal
        }]);
      }
    }
  }, [preselectedKingId, kings, dynasties]);
  
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
    
    // Clear warning when field is modified
    if (warnings[name]) {
      setWarnings({
        ...warnings,
        [name]: null
      });
    }
  };
  
  const handleKingSelect = (king) => {
    const { id, name, dynastyId, dynastyName, isOneTime } = king;
    
    // Update selected kings
    setSelectedKings([...selectedKings, king]);
    
    // Update kingIds in form data
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, id]
    });
  };
  
  const handleKingRemove = (kingId) => {
    // Check if this is a preselected king (from ruler page) - cannot remove
    const kingToRemove = selectedKings.find(k => k.id === kingId);
    if (kingToRemove && kingToRemove.isPreselected) {
      return;
    }
    
    // Update selected kings
    setSelectedKings(selectedKings.filter(king => king.id !== kingId));
    
    // Update kingIds in form data
    setFormData({
      ...formData,
      kingIds: formData.kingIds.filter(id => id !== kingId),
      // Also remove from participants if it's a war
      participants: formData.participants.filter(p => p.kingId !== kingId)
    });
  };
  
  const handleAddParticipant = (king) => {
    // Create a new participant
    const newParticipant = {
      kingId: king.id,
      name: king.name,
      dynastyName: king.dynastyName,
      role: 'participant',
      side: '',
      notes: ''
    };
    
    // Update participants in form data
    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant]
    });
  };
  
  const handleUpdateParticipant = (kingId, field, value) => {
    // Update the specified field for the participant
    setFormData({
      ...formData,
      participants: formData.participants.map(p => 
        p.kingId === kingId ? { ...p, [field]: value } : p
      )
    });
  };
  
  const handleRemoveParticipant = (kingId) => {
    // Check if this is a preselected king (from ruler page) - cannot remove
    const kingToRemove = selectedKings.find(k => k.id === kingId);
    if (kingToRemove && kingToRemove.isPreselected) {
      return;
    }
    
    // Remove participant
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.kingId !== kingId)
    });
  };
  
  const validate = () => {
    const newErrors = {};
    const newWarnings = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    // Allow missing date, but add a warning
    if (!formData.date.trim()) {
      newWarnings.date = 'No date provided - this may affect timeline visualization';
    } else if (formData.date.trim() && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(formData.date.trim())) {
      newErrors.date = 'Date format should be YYYY, YYYY-MM, or YYYY-MM-DD';
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
    setWarnings(newWarnings);
    
    // Show warnings in notification if there are any but not blocking submission
    if (Object.keys(newWarnings).length > 0) {
      const warningMessages = Object.values(newWarnings).join(', ');
      setNotification({
        type: 'warning',
        message: warningMessages
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Process one-time kings if any
    const kingIdsMap = new Map();
    for (const king of selectedKings) {
      if (king.isOneTime) {
        try {
          // Create real one-time king
          const newKing = await addOneTimeKing({
            name: king.name,
            dynastyName: king.dynastyName,
            color: generateRandomColor()
          });
          kingIdsMap.set(king.id, newKing.id);
        } catch (error) {
          setNotification({
            type: 'error',
            message: `Error creating one-time ruler: ${error.message}`
          });
          return;
        }
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
        warType: formData.warType,
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
    
    try {
      await addEvent(eventData);
      setNotification({
        type: 'success',
        message: `${formData.isWar ? 'War/conflict' : 'Event'} successfully added!`
      });
      
      // Close after successful notification
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Error adding ${formData.isWar ? 'war/conflict' : 'event'}: ${error.message}`
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">
        Add New {formData.isWar ? 'War/Conflict' : 'Historical Event'}
      </div>
      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Basic Info (name, date, type, etc.) */}
      <EventBasicInfo 
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        warnings={warnings}
      />
      
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
        
        {/* King Selection Component */}
        <KingSearchBox
          selectedKings={selectedKings}
          onKingSelect={handleKingSelect}
          onKingRemove={handleKingRemove}
          excludeKingIds={formData.kingIds}
          error={errors.kingIds}
          preselectedKingId={preselectedKingId}
        />
        
        {/* War Participants Editor (Only shown for wars) */}
        {formData.isWar && selectedKings.length > 0 && (
          <WarParticipantsEditor
            participants={formData.participants}
            selectedKings={selectedKings}
            onAddParticipant={handleAddParticipant}
            onUpdateParticipant={handleUpdateParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            preselectedKingId={preselectedKingId}
            error={errors.participants}
          />
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

export default EventForm;
