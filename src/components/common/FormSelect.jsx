import React from 'react';

/**
 * Reusable component for select dropdowns
 * Memoized to prevent unnecessary re-renders
 */
const FormSelect = React.memo(({ 
  id, 
  name, 
  value, 
  onChange, 
  options,
  label, 
  error, 
  isRequired = false,
  disabled = false,
  className = ""
}) => {
  // Memoize option elements to prevent recreating them on each render
  const optionElements = React.useMemo(() => {
    return options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }, [options]);

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label} {isRequired ? "" : "(optional)"}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 border rounded-md ${
          error
            ? "border-red-500 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {optionElements}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

export default FormSelect;