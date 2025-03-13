import React from 'react';

/**
 * Reusable component for textarea inputs
 * Memoized to prevent unnecessary re-renders
 */
const FormTextArea = React.memo(({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  label, 
  rows = 3,
  isRequired = false,
  className = ""
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label} {isRequired ? "" : "(optional)"}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder={placeholder}
      />
    </div>
  );
});

export default FormTextArea;