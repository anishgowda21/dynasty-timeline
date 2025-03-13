import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { formatYear } from "../utils/dateUtils";
import { 
  DateInput, 
  FormInput, 
  FormSelect, 
  FormTextArea, 
  FormActions 
} from "./common";

const AddKingForm = ({
  onClose,
  preselectedDynastyId = null,
  initialData,
  initialBCE,
  isEditing,
  onSave,
}) => {
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
    ...(initialData || {}), // Use initialData if provided
  });

  const [startYearBce, setStartYearBce] = useState(
    initialBCE?.startYearBce || false
  );
  const [endYearBce, setEndYearBce] = useState(initialBCE?.endYearBce || false);
  const [birthYearBce, setBirthYearBce] = useState(
    initialBCE?.birthYearBce || false
  );
  const [deathYearBce, setDeathYearBce] = useState(
    initialBCE?.deathYearBce || false
  );
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Update BCE states when initialBCE changes
  useEffect(() => {
    if (initialBCE) {
      setStartYearBce(initialBCE.startYearBce || false);
      setEndYearBce(initialBCE.endYearBce || false);
      setBirthYearBce(initialBCE.birthYearBce || false);
      setDeathYearBce(initialBCE.deathYearBce || false);
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

    if (isEditing && onSave) {
      onSave(kingData);
    } else {
      addKing(kingData);
    }

    if (onClose) onClose();
  };

  // Prepare dynasty options for select
  const dynastyOptions = [
    { value: "", label: "Select a dynasty" },
    ...dynasties.map((dynasty) => ({
      value: dynasty.id,
      label: `${dynasty.name} (${formatYear(dynasty.startYear)} - ${formatYear(dynasty.endYear)})`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4 dark:text-white">
        {isEditing ? `Edit ${formData.name}` : "Add New Ruler"}
      </div>

      <FormInput
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        label="Ruler Name"
        placeholder="e.g., Elizabeth I, Louis XIV"
        error={errors.name}
        isRequired={true}
      />

      <FormSelect
        id="dynastyId"
        name="dynastyId"
        value={formData.dynastyId}
        onChange={handleChange}
        options={dynastyOptions}
        label="Dynasty"
        error={errors.dynastyId}
        isRequired={true}
        disabled={isEditing && preselectedDynastyId}
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          id="startYear"
          name="startYear"
          value={formData.startYear}
          onChange={handleChange}
          isBce={startYearBce}
          onBceChange={setStartYearBce}
          label="Start Year of Reign"
          placeholder="e.g., 1558"
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
          label="End Year of Reign"
          placeholder="e.g., 1603"
          error={errors.endYear}
          isRequired={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          id="birthYear"
          name="birthYear"
          value={formData.birthYear}
          onChange={handleChange}
          isBce={birthYearBce}
          onBceChange={setBirthYearBce}
          label="Birth Year"
          placeholder="e.g., 1533"
          error={errors.birthYear}
        />

        <DateInput
          id="deathYear"
          name="deathYear"
          value={formData.deathYear}
          onChange={handleChange}
          isBce={deathYearBce}
          onBceChange={setDeathYearBce}
          label="Death Year"
          placeholder="e.g., 1603"
          error={errors.deathYear}
        />
      </div>

      <FormTextArea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        label="Description"
        placeholder="Brief description of the ruler..."
      />

      <FormInput
        id="imageUrl"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        label="Image URL"
        placeholder="https://example.com/image.jpg"
      />

      <FormActions
        onCancel={onClose}
        isEditing={isEditing}
        submitLabel={isEditing ? "Save Changes" : "Add Ruler"}
      />
    </form>
  );
};

export default AddKingForm;