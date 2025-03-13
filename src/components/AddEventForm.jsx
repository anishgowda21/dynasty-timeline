import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { generateRandomColor } from "../utils/colorUtils";
import { 
  FormInput, 
  FormSelect, 
  FormTextArea, 
  FormActions,
  RulerPicker
} from "./common";

const AddEventForm = ({
  onClose,
  preselectedKingId = null,
  initialData = null,
  initialBCE = null,
  isEditing = false,
  onSave = null,
}) => {
  const { addEvent, kings, dynasties, addOneTimeKing, uiSettings } =
    useDynasty();

  const initialSelectedKingIds = preselectedKingId ? [preselectedKingId] : [];

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    kingIds: initialSelectedKingIds,
    type: "",
    importance: "medium",
    ...(initialData || {}), // Use initialData if provided
  });

  const [dateBce, setDateBce] = useState(initialBCE?.dateBce || false);
  const [selectedKings, setSelectedKings] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize form data from initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Set BCE state if provided
  useEffect(() => {
    if (initialBCE && initialBCE.dateBce !== undefined) {
      setDateBce(initialBCE.dateBce);
    }
  }, [initialBCE]);

  // Initialize selected kings from preselected ID or from initialData
  useEffect(() => {
    const initKings = [];

    // Handle preselected king if provided
    if (preselectedKingId) {
      const king = kings.find((k) => k.id === preselectedKingId);
      if (king) {
        initKings.push({
          id: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName: king.dynastyId
            ? dynasties.find((d) => d.id === king.dynastyId)?.name
            : null,
        });
      }
    }

    // Handle kings from initialData if editing
    if (
      isEditing &&
      initialData &&
      initialData.kingIds &&
      initialData.kingIds.length > 0
    ) {
      initialData.kingIds.forEach((kingId) => {
        if (!initKings.find((k) => k.id === kingId)) {
          // Avoid duplicates
          const king = kings.find((k) => k.id === kingId);
          if (king) {
            initKings.push({
              id: king.id,
              name: king.name,
              dynastyId: king.dynastyId,
              dynastyName:
                king.dynastyName ||
                (king.dynastyId
                  ? dynasties.find((d) => d.id === king.dynastyId)?.name
                  : null),
            });
          }
        }
      });
    }

    if (initKings.length > 0) {
      setSelectedKings(initKings);
    }
  }, [preselectedKingId, kings, dynasties, isEditing, initialData]);

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

  const handleDateBceChange = (newValue) => {
    setDateBce(newValue);
  };

  const handleAddRuler = (ruler) => {
    setSelectedKings([...selectedKings, ruler]);
    setFormData({
      ...formData,
      kingIds: [...formData.kingIds, ruler.id || ruler.kingId],
    });
  };

  const handleRemoveRuler = (ruler) => {
    // Don't allow removal of preselected kings (from ruler page)
    if (preselectedKingId && (ruler.id === preselectedKingId || ruler.kingId === preselectedKingId)) {
      return;
    }

    const kingId = ruler.id || ruler.kingId;
    setSelectedKings(selectedKings.filter((k) => (k.id !== kingId && k.kingId !== kingId)));
    setFormData({
      ...formData,
      kingIds: formData.kingIds.filter((id) => id !== kingId),
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    // Date is encouraged but not strictly required
    if (!formData.date.trim()) {
      if (uiSettings?.validationLevel === "strict") {
        newErrors.date = "Date is required";
      }
    }

    // Validate that at least one ruler is selected
    if (formData.kingIds.length === 0) {
      newErrors.kingIds = "At least one ruler must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Process one-time kings if any
    const kingIdsMap = new Map();
    for (const king of selectedKings) {
      if (king.isOneTime) {
        // Create real one-time king
        const newKing = await addOneTimeKing({
          name: king.name,
          dynastyName: king.dynastyName,
          color: generateRandomColor(),
        });
        kingIdsMap.set(king.id || king.kingId, newKing.id);
      } else {
        kingIdsMap.set(king.id || king.kingId, king.id || king.kingId);
      }
    }

    // Replace temporary IDs with real ones
    const finalKingIds = formData.kingIds.map((id) =>
      kingIdsMap.has(id) ? kingIdsMap.get(id) : id
    );

    // Process date for BCE if needed
    let processedDate = formData.date;

    // If it's just a year and BCE is checked, convert to internal format
    if (
      processedDate &&
      processedDate.trim().length === 4 &&
      !isNaN(parseInt(processedDate)) &&
      dateBce
    ) {
      const year = parseInt(processedDate);
      const internalYear = -year + 1; // Convert to internal BCE format
      processedDate = internalYear.toString();
    }

    // Create event data
    const eventData = {
      name: formData.name,
      date: processedDate,
      description: formData.description,
      type: formData.type,
      importance: formData.importance,
      kingIds: finalKingIds,
    };

    // If editing, use the provided callback, otherwise add a new event
    if (isEditing && onSave) {
      onSave(eventData);
    } else {
      addEvent(eventData);
    }

    if (onClose) onClose();
  };

  // Prepare options for dropdowns
  const eventTypes = [
    { value: "", label: "Select Type" },
    { value: "Religious", label: "Religious" },
    { value: "Political", label: "Political" },
    { value: "Cultural", label: "Cultural" },
    { value: "Economic", label: "Economic" },
    { value: "Scientific", label: "Scientific" },
    { value: "Diplomatic", label: "Diplomatic" },
    { value: "Military", label: "Military" },
    { value: "Other", label: "Other" },
  ];

  const importanceLevels = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="text-xl font-bold mb-4 dark:text-white">
          Add New Historical Event
        </div>
      )}

      <FormInput
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        label="Event Name"
        placeholder="e.g., Signing of Magna Carta"
        error={errors.name}
        isRequired={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Date
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.date
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder="YYYY-MM-DD or just YYYY"
            />
            <div className="ml-2 flex items-center">
              <input
                type="checkbox"
                id="dateBce"
                checked={dateBce}
                onChange={(e) => handleDateBceChange(e.target.checked)}
                className="mr-1 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="dateBce" className="text-sm dark:text-gray-300">
                BCE
              </label>
            </div>
          </div>
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You can use YYYY-MM-DD format or just the year (YYYY)
          </p>
        </div>

        <FormSelect
          id="importance"
          name="importance"
          value={formData.importance}
          onChange={handleChange}
          options={importanceLevels}
          label="Importance"
        />
      </div>

      <FormSelect
        id="type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        options={eventTypes}
        label="Event Type"
      />

      <FormTextArea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        label="Description"
        placeholder="Describe the historical event..."
      />

      {/* Kings/Rulers Selection Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium dark:text-white">
            Related Rulers
          </h3>
        </div>

        <RulerPicker
          selectedRulers={selectedKings}
          onAddRuler={handleAddRuler}
          onRemoveRuler={handleRemoveRuler}
          error={errors.kingIds}
          preselectedKingId={preselectedKingId}
        />
      </div>

      <FormActions
        onCancel={onClose}
        isEditing={isEditing}
        submitLabel={isEditing ? "Save Changes" : "Add Event"}
      />
    </form>
  );
};

export default AddEventForm;