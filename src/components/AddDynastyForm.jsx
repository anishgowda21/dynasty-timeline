import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { parseYear, formatYear } from "../utils/dateUtils";

const AddDynastyForm = ({
  onClose,
  initialData,
  initialBCE,
  isEditing,
  onSave,
}) => {
  const { addDynasty } = useDynasty();
  const [formData, setFormData] = useState({
    name: "",
    startYear: "",
    endYear: "",
    color: "#4F46E5",
    description: "",
    ...(initialData || {}), // Use initialData if provided
  });

  const [startYearBce, setStartYearBce] = useState(
    initialBCE?.startYearBce || false
  );
  const [endYearBce, setEndYearBce] = useState(initialBCE?.endYearBce || false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialBCE) {
      setStartYearBce(initialBCE.startYearBce);
      setEndYearBce(initialBCE.endYearBce);
    }
  }, [initialBCE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Dynasty name is required";
    }

    if (!formData.startYear) {
      newErrors.startYear = "Start year is required";
    } else if (isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = "Start year must be a number";
    }

    // End year can be empty for dynasties that are still ongoing
    if (formData.endYear && isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = "End year must be a number";
    }

    // Only compare years if both are provided and valid
    if (
      formData.endYear &&
      !isNaN(parseInt(formData.startYear)) &&
      !isNaN(parseInt(formData.endYear))
    ) {
      // Convert years to internal representation for comparison
      let startYearValue = parseInt(formData.startYear);
      let endYearValue = parseInt(formData.endYear);

      // Apply BCE conversion if needed
      if (startYearBce && !isNaN(startYearValue)) {
        startYearValue = -startYearValue + 1;
      }

      if (endYearBce && !isNaN(endYearValue)) {
        endYearValue = -endYearValue + 1;
      }

      if (startYearValue > endYearValue) {
        newErrors.endYear = "End year must be after start year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Convert years to internal representation
    let startYearValue = parseInt(formData.startYear);
    let endYearValue = formData.endYear ? parseInt(formData.endYear) : null;

    // Apply BCE conversion if needed
    if (startYearBce && !isNaN(startYearValue)) {
      startYearValue = -startYearValue + 1;
    }

    if (endYearBce && !isNaN(endYearValue)) {
      endYearValue = -endYearValue + 1;
    }

    const finalData = {
      ...formData,
      startYear: startYearValue,
      endYear: endYearValue,
    };

    if (isEditing && onSave) {
      onSave(finalData);
    } else {
      addDynasty(finalData);
    }

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="text-xl font-bold mb-4">Add New Dynasty</div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
        >
          Dynasty Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          }
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400
            `}
          placeholder="e.g., Tudor, Ming, Habsburg"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startYear"
            className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-1"
          >
            Start Year
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="startYear"
              name="startYear"
              value={formData.startYear}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.startYear ? "border-red-500" : "border-gray-300"
              }
              bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400  
              `}
              placeholder="e.g., 1485"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="startYearBce"
                checked={startYearBce}
                onChange={() => setStartYearBce(!startYearBce)}
                className="mr-1"
              />
              <label htmlFor="startYearBce" className="text-sm">
                BCE
              </label>
            </div>
          </div>
          {errors.startYear && (
            <p className="text-red-500 text-xs mt-1">{errors.startYear}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="endYear"
            className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-1"
          >
            End Year {!isEditing && "(leave blank if ongoing)"}
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="endYear"
              name="endYear"
              value={formData.endYear}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.endYear ? "border-red-500" : "border-gray-300"
              }
              bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400  
              `}
              placeholder="e.g., 1603"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="endYearBce"
                checked={endYearBce}
                onChange={() => setEndYearBce(!endYearBce)}
                className="mr-1"
              />
              <label htmlFor="endYearBce" className="text-sm">
                BCE
              </label>
            </div>
          </div>
          {errors.endYear && (
            <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-1"
        >
          Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="h-10 w-10 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={formData.color}
            onChange={handleChange}
            name="color"
            className="ml-2 p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          placeholder="Brief description of the dynasty..."
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditing ? "Save Changes" : "Add Dynasty"}
        </button>
      </div>
    </form>
  );
};

export default AddDynastyForm;
