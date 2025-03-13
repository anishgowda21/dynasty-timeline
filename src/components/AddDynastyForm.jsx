import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { DateInput, FormInput, FormTextArea, FormActions } from "./common";

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
        <div className="text-xl font-bold mb-4 dark:text-white">Add New Dynasty</div>
      )}

      <FormInput
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        label="Dynasty Name"
        placeholder="e.g., Tudor, Ming, Habsburg"
        error={errors.name}
        isRequired={true}
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          id="startYear"
          name="startYear"
          value={formData.startYear}
          onChange={handleChange}
          isBce={startYearBce}
          onBceChange={setStartYearBce}
          label="Start Year"
          placeholder="e.g., 1485"
          error={errors.startYear}
          isRequired={true}
        />

        <DateInput
          id="endYear"
          name="endYear"
          value={formData.endYear}
          onChange={handleChange}
          isBce={endYearBce}
          onBceChange={setEndYearBce}
          label={`End Year ${!isEditing ? "(leave blank if ongoing)" : ""}`}
          placeholder="e.g., 1603"
          error={errors.endYear}
        />
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
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
            className="ml-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <FormTextArea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        label="Description"
        placeholder="Brief description of the dynasty..."
      />

      <FormActions
        onCancel={onClose}
        isEditing={isEditing}
        submitLabel={isEditing ? "Save Changes" : "Add Dynasty"}
      />
    </form>
  );
};

export default AddDynastyForm;