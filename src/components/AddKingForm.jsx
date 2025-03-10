import { useState } from "react";
import { useDynasty } from "../context/DynastyContext";
import { parseYear, formatYear } from "../utils/dateUtils";

const AddKingForm = ({ onClose, preselectedDynastyId = null }) => {
  const { addKing, dynasties } = useDynasty();
  const [formData, setFormData] = useState({
    name: "",
    dynastyId: preselectedDynastyId || "",
    startYear: "",
    endYear: "",
    birthYear: "",
    deathYear: "",
    description: "",
    imageUrl: "",
  });
  const [startYearBce, setStartYearBce] = useState(false);
  const [endYearBce, setEndYearBce] = useState(false);
  const [birthYearBce, setBirthYearBce] = useState(false);
  const [deathYearBce, setDeathYearBce] = useState(false);
  const [errors, setErrors] = useState({});

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
      newErrors.name = "Ruler name is required";
    }

    if (!formData.dynastyId) {
      newErrors.dynastyId = "Dynasty is required";
    }

    if (!formData.startYear) {
      newErrors.startYear = "Start year of reign is required";
    } else if (isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = "Start year must be a number";
    }

    if (!formData.endYear) {
      newErrors.endYear = "End year of reign is required";
    } else if (isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = "End year must be a number";
    }

    // Convert years to internal representation for comparison
    let startYearValue = parseInt(formData.startYear);
    let endYearValue = parseInt(formData.endYear);
    let birthYearValue = formData.birthYear
      ? parseInt(formData.birthYear)
      : null;
    let deathYearValue = formData.deathYear
      ? parseInt(formData.deathYear)
      : null;

    // Apply BCE conversion if needed
    if (startYearBce && !isNaN(startYearValue)) {
      startYearValue = -startYearValue + 1;
    }

    if (endYearBce && !isNaN(endYearValue)) {
      endYearValue = -endYearValue + 1;
    }

    if (birthYearBce && birthYearValue !== null && !isNaN(birthYearValue)) {
      birthYearValue = -birthYearValue + 1;
    }

    if (deathYearBce && deathYearValue !== null && !isNaN(deathYearValue)) {
      deathYearValue = -deathYearValue + 1;
    }

    if (
      !isNaN(startYearValue) &&
      !isNaN(endYearValue) &&
      startYearValue > endYearValue
    ) {
      newErrors.endYear = "End year must be after start year";
    }

    if (formData.birthYear && isNaN(parseInt(formData.birthYear))) {
      newErrors.birthYear = "Birth year must be a number";
    }

    if (formData.deathYear && isNaN(parseInt(formData.deathYear))) {
      newErrors.deathYear = "Death year must be a number";
    }

    if (
      birthYearValue !== null &&
      deathYearValue !== null &&
      !isNaN(birthYearValue) &&
      !isNaN(deathYearValue) &&
      birthYearValue > deathYearValue
    ) {
      newErrors.deathYear = "Death year must be after birth year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Convert years to internal representation
    let startYearValue = parseInt(formData.startYear);
    let endYearValue = parseInt(formData.endYear);
    let birthYearValue = formData.birthYear
      ? parseInt(formData.birthYear)
      : null;
    let deathYearValue = formData.deathYear
      ? parseInt(formData.deathYear)
      : null;

    // Apply BCE conversion if needed
    if (startYearBce && !isNaN(startYearValue)) {
      startYearValue = -startYearValue + 1;
    }

    if (endYearBce && !isNaN(endYearValue)) {
      endYearValue = -endYearValue + 1;
    }

    if (birthYearBce && birthYearValue !== null && !isNaN(birthYearValue)) {
      birthYearValue = -birthYearValue + 1;
    }

    if (deathYearBce && deathYearValue !== null && !isNaN(deathYearValue)) {
      deathYearValue = -deathYearValue + 1;
    }

    const kingData = {
      ...formData,
      startYear: startYearValue,
      endYear: endYearValue,
    };

    // Only include birth/death years if they're provided
    if (formData.birthYear) {
      kingData.birthYear = birthYearValue;
    }

    if (formData.deathYear) {
      kingData.deathYear = deathYearValue;
    }

    addKing(kingData);

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">Add New Ruler</div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ruler Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., Elizabeth I, Louis XIV"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="dynastyId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Dynasty
        </label>
        <select
          id="dynastyId"
          name="dynastyId"
          value={formData.dynastyId}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${
            errors.dynastyId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select a dynasty</option>
          {dynasties.map((dynasty) => (
            <option key={dynasty.id} value={dynasty.id}>
              {dynasty.name} ({formatYear(dynasty.startYear)} -{" "}
              {formatYear(dynasty.endYear)})
            </option>
          ))}
        </select>
        {errors.dynastyId && (
          <p className="text-red-500 text-xs mt-1">{errors.dynastyId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startYear"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Year of Reign
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
              }`}
              placeholder="e.g., 1558"
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Year of Reign
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
              }`}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="birthYear"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birth Year (optional)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.birthYear ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 1533"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="birthYearBce"
                checked={birthYearBce}
                onChange={() => setBirthYearBce(!birthYearBce)}
                className="mr-1"
              />
              <label htmlFor="birthYearBce" className="text-sm">
                BCE
              </label>
            </div>
          </div>
          {errors.birthYear && (
            <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="deathYear"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Death Year (optional)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="deathYear"
              name="deathYear"
              value={formData.deathYear}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.deathYear ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 1603"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="deathYearBce"
                checked={deathYearBce}
                onChange={() => setDeathYearBce(!deathYearBce)}
                className="mr-1"
              />
              <label htmlFor="deathYearBce" className="text-sm">
                BCE
              </label>
            </div>
          </div>
          {errors.deathYear && (
            <p className="text-red-500 text-xs mt-1">{errors.deathYear}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Image URL (optional)
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
        <button type="submit" className="btn btn-primary">
          Add Ruler
        </button>
      </div>
    </form>
  );
};

export default AddKingForm;
