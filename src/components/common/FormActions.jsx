import React from 'react';

/**
 * Reusable component for form action buttons
 */
const FormActions = ({ 
  onCancel, 
  isEditing = false,
  submitLabel,
  cancelLabel = "Cancel",
  className = "" 
}) => {
  return (
    <div className={`flex justify-end space-x-2 pt-4 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {cancelLabel}
      </button>
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {submitLabel || (isEditing ? "Save Changes" : "Add")}
      </button>
    </div>
  );
};

export default FormActions;