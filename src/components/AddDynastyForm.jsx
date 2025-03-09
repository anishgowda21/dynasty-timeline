import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';

const AddDynastyForm = ({ onClose }) => {
  const { addDynasty } = useDynasty();
  const [formData, setFormData] = useState({
    name: '',
    startYear: '',
    endYear: '',
    color: '#4F46E5',
    description: ''
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
      newErrors.name = 'Dynasty name is required';
    }
    
    if (!formData.startYear) {
      newErrors.startYear = 'Start year is required';
    } else if (isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = 'Start year must be a number';
    }
    
    if (!formData.endYear) {
      newErrors.endYear = 'End year is required';
    } else if (isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = 'End year must be a number';
    }
    
    if (formData.startYear && formData.endYear && 
        parseInt(formData.startYear) > parseInt(formData.endYear)) {
      newErrors.endYear = 'End year must be after start year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addDynasty({
      ...formData,
      startYear: parseInt(formData.startYear),
      endYear: parseInt(formData.endYear)
    });
    
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">Add New Dynasty</div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Dynasty Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="e.g., Tudor, Ming, Habsburg"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
            placeholder="e.g., 1485"
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
            placeholder="e.g., 1603"
          />
          {errors.endYear && <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="h-10 w-10 rounded-md border border-gray-300 cursor-pointer"
          />
          <input 
            type="text"
            value={formData.color}
            onChange={handleChange}
            name="color"
            className="ml-2 p-2 border border-gray-300 rounded-md"
          />
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
          placeholder="Brief description of the dynasty..."
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
          Add Dynasty
        </button>
      </div>
    </form>
  );
};

export default AddDynastyForm;
