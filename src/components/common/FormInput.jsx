import React from 'react';

/**
 * Reusable component for text/number inputs with consistent styling
 */
const FormInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  label, 
  error, 
  type = "text",
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
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md ${
          error
            ? "border-red-500 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;