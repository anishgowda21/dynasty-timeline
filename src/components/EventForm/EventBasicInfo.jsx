import React from 'react';

const EventBasicInfo = ({ 
  formData, 
  handleChange, 
  errors, 
  warnings 
}) => {
  const eventTypes = [
    'Religious',
    'Political',
    'Cultural',
    'Economic',
    'Scientific',
    'Diplomatic',
    'Coronation',
    'Marriage',
    'Death',
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
    'Territorial',
    'Battle',
    'Siege',
    'Invasion',
    'Rebellion',
    'Other'
  ];
  
  const importanceLevels = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <>
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
            {formData.isWar ? 'Start Date' : 'Date'} <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.date ? 'border-red-500' : 
              warnings.date ? 'border-yellow-500' : 
              'border-gray-300'
            }`}
            placeholder="YYYY-MM-DD or just YYYY"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          {warnings.date && <p className="text-yellow-600 text-xs mt-1">{warnings.date}</p>}
          <p className="text-xs text-gray-500 mt-1">You can use YYYY-MM-DD format or just the year (YYYY)</p>
        </div>
        
        {formData.isWar && (
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-gray-400 text-xs">(Optional)</span>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            {formData.isWar ? 'War Type' : 'Event Type'}
          </label>
          <select
            id={formData.isWar ? "warType" : "type"}
            name={formData.isWar ? "warType" : "type"}
            value={formData.isWar ? formData.warType : formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
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
            Location <span className="text-gray-400 text-xs">(Optional)</span>
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
    </>
  );
};

export default EventBasicInfo;
