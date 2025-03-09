import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';

const AddKingForm = ({ onClose, preselectedDynastyId = null }) => {
  const { addKing, dynasties } = useDynasty();
  const [formData, setFormData] = useState({
    name: '',
    dynastyId: preselectedDynastyId || '',
    startYear: '',
    endYear: '',
    birthYear: '',
    deathYear: '',
    description: '',
    imageUrl: ''
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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ruler name is required';
    }
    
    if (!formData.dynastyId) {
      newErrors.dynastyId = 'Dynasty is required';
    }
    
    if (!formData.startYear) {
      newErrors.startYear = 'Start year of reign is required';
    } else if (isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = 'Start year must be a number';
    }
    
    if (!formData.endYear) {
      newErrors.endYear = 'End year of reign is required';
    } else if (isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = 'End year must be a number';
    }
    
    if (formData.startYear && formData.endYear && 
        parseInt(formData.startYear) > parseInt(formData.endYear)) {
      newErrors.endYear = 'End year must be after start year';
    }
    
    if (formData.birthYear && isNaN(parseInt(formData.birthYear))) {
      newErrors.birthYear = 'Birth year must be a number';
    }
    
    if (formData.deathYear && isNaN(parseInt(formData.deathYear))) {
      newErrors.deathYear = 'Death year must be a number';
    }
    
    if (formData.birthYear && formData.deathYear && 
        parseInt(formData.birthYear) > parseInt(formData.deathYear)) {
      newErrors.deathYear = 'Death year must be after birth year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const kingData = {
      ...formData,
      startYear: parseInt(formData.startYear),
      endYear: parseInt(formData.endYear),
    };
    
    // Only include birth/death years if they're provided
    if (formData.birthYear) {
      kingData.birthYear = parseInt(formData.birthYear);
    }
    
    if (formData.deathYear) {
      kingData.deathYear = parseInt(formData.deathYear);
    }
    
    addKing(kingData);
    
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">Add New Ruler</div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Ruler Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="e.g., Henry VIII, Elizabeth I"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="dynastyId" className="block text-sm font-medium text-gray-700 mb-1">
          Dynasty
        </label>
        <select
          id="dynastyId"
          name="dynastyId"
          value={formData.dynastyId}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.dynastyId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={preselectedDynastyId !== null}
        >
          <option value="">Select Dynasty</option>
          {dynasties.map(dynasty => (
            <option key={dynasty.id} value={dynasty.id}>
              {dynasty.name} ({dynasty.startYear} - {dynasty.endYear})
            </option>
          ))}
        </select>
        {errors.dynastyId && <p className="text-red-500 text-xs mt-1">{errors.dynastyId}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year of Reign
          </label>
          <input
            type="number"
            id="startYear"
            name="startYear"
            value={formData.startYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.startYear ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., 1509"
          />
          {errors.startYear && <p className="text-red-500 text-xs mt-1">{errors.startYear}</p>}
        </div>
        
        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year of Reign
          </label>
          <input
            type="number"
            id="endYear"
            name="endYear"
            value={formData.endYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.endYear ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., 1547"
          />
          {errors.endYear && <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Year (Optional)
          </label>
          <input
            type="number"
            id="birthYear"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.birthYear ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., 1491"
          />
          {errors.birthYear && <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>}
        </div>
        
        <div>
          <label htmlFor="deathYear" className="block text-sm font-medium text-gray-700 mb-1">
            Death Year (Optional)
          </label>
          <input
            type="number"
            id="deathYear"
            name="deathYear"
            value={formData.deathYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.deathYear ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., 1547"
          />
          {errors.deathYear && <p className="text-red-500 text-xs mt-1">{errors.deathYear}</p>}
        </div>
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
          placeholder="Brief description of the ruler..."
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (Optional)
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="https://example.com/image.jpg"
        />
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
          Add Ruler
        </button>
      </div>
    </form>
  );
};

export default AddKingForm;
