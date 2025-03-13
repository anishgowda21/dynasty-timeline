import React from 'react';

/**
 * Reusable component for date inputs with BCE toggle
 * Memoized to prevent unnecessary re-renders
 */
const DateInput = React.memo(({ 
  id, 
  name, 
  value, 
  onChange, 
  isBce, 
  onBceChange, 
  placeholder, 
  label, 
  error, 
  isRequired = false,
  className = "",
  type = "number"
}) => {
  // Handle BCE toggle with a callback to prevent creating new functions on each render
  const handleBceToggle = React.useCallback(() => {
    onBceChange(!isBce);
  }, [isBce, onBceChange]);

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label} {isRequired ? "" : "(optional)"}
      </label>
      <div className="flex items-center">
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
        <div className="ml-2 flex items-center">
          <input
            type="checkbox"
            id={`${id}Bce`}
            checked={isBce}
            onChange={handleBceToggle}
            className="mr-1 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`${id}Bce`}
            className="text-sm dark:text-gray-300"
          >
            BCE
          </label>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

export default DateInput;