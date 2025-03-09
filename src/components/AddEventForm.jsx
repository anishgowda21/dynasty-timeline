import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';

const AddEventForm = ({ onClose, preselectedKingId = null }) => {
  const { addEvent, kings } = useDynasty();
  const initialKingIds = preselectedKingId ? [preselectedKingId] : [];

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    kingIds: initialKingIds,
    type: '',
    importance: 'medium',
  });
  const [errors, setErrors] = useState({});

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

  const handleKingSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      kingIds: options
    });
    
    if (errors.kingIds) {
      setErrors({
        ...errors,
        kingIds: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.kingIds || formData.kingIds.length === 0) {
      newErrors.kingIds = 'At least one ruler must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addEvent(formData);
    
    if (onClose) onClose();
  };

  const eventTypes = [
    'Battle',
    'Religious',
    'Political',
    'Cultural',
    'Economic',
    'Scientific',
    'Other'
  ];

  const importanceLevels = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">Add New Historical Event</div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="e.g., Battle of Waterloo, Signing of Magna Carta"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
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
      
      <div className="grid grid-cols-2 gap-4">
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
          >
            <option value="">Select Type</option>
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
        <label htmlFor="kingIds" className="block text-sm font-medium text-gray-700 mb-1">
          Related Rulers
        </label>
        <select
          id="kingIds"
          name="kingIds"
          multiple
          value={formData.kingIds}
          onChange={handleKingSelect}
          className={`w-full p-2 border rounded-md h-32 ${errors.kingIds ? 'border-red-500' : 'border-gray-300'}`}
        >
          {kings.map(king => (
            <option key={king.id} value={king.id}>
              {king.name} ({king.startYear} - {king.endYear})
            </option>
          ))}
        </select>
        {errors.kingIds && <p className="text-red-500 text-xs mt-1">{errors.kingIds}</p>}
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple rulers</p>
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
          placeholder="Describe the historical event..."
        ></textarea>
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
          Add Event
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
