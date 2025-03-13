import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import { generateRandomColor } from "../utils/colorUtils";
import { 
  DateInput,
  FormInput, 
  FormSelect, 
  FormTextArea, 
  FormActions,
  RulerPicker
} from "./common";

const AddWarForm = ({
  onClose,
  preselectedKingId = null,
  initialData = null,
  isEditing = false,
  onSave = null,
}) => {
  const { addWar, kings, dynasties, addOneTimeKing } = useDynasty();

  // Initialize with preselected king if available or use initialData if provided
  const [formData, setFormData] = useState({
    name: "",
    startYear: "",
    endYear: "",
    description: "",
    participants: [],
    location: "",
    type: "Conquest", // Set Conquest as default war type
    importance: "medium",
    ...(initialData || {}), // Use initialData if provided
  });

  const [startYearBce, setStartYearBce] = useState(false);
  const [endYearBce, setEndYearBce] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Initialize form data from initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);

      // Handle BCE years
      if (initialData.startYear && initialData.startYear < 0) {
        setStartYearBce(true);
        setFormData((prev) => ({
          ...prev,
          startYear: Math.abs(initialData.startYear - 1).toString(), // Convert from internal format
        }));
      }

      if (initialData.endYear && initialData.endYear < 0) {
        setEndYearBce(true);
        setFormData((prev) => ({
          ...prev,
          endYear: Math.abs(initialData.endYear - 1).toString(), // Convert from internal format
        }));
      }
    }
  }, [initialData]);

  // Initialize selected participants from preselected king if provided or from initialData
  useEffect(() => {
    const initParticipants = [];

    // Handle preselected king if provided
    if (preselectedKingId) {
      const king = kings.find((k) => k.id === preselectedKingId);
      if (king) {
        const preselectedParticipant = {
          kingId: king.id,
          name: king.name,
          dynastyId: king.dynastyId,
          dynastyName: king.dynastyId
            ? dynasties.find((d) => d.id === king.dynastyId)?.name
            : null,
          role: "participant", // Default role, but can be changed by user
          isPreselected: true,
        };

        initParticipants.push(preselectedParticipant);
      }
    }

    // Handle participants from initialData if editing
    if (
      isEditing &&
      initialData &&
      initialData.participants &&
      initialData.participants.length > 0
    ) {
      initialData.participants.forEach((p) => {
        if (
          !initParticipants.some((existing) => existing.kingId === p.kingId)
        ) {
          // Avoid duplicates
          const king = kings.find((k) => k.id === p.kingId);

          // For display purposes, create a full object
          const participant = {
            kingId: p.kingId,
            role: p.role || "participant",
            // Additional data just for UI display
            name: king ? king.name : "Unknown",
            dynastyId: king ? king.dynastyId : null,
            dynastyName:
              king && king.dynastyId
                ? dynasties.find((d) => d.id === king.dynastyId)?.name
                : king && king.dynastyName
                ? king.dynastyName
                : null,
          };
          initParticipants.push(participant);
        }
      });
    }

    if (initParticipants.length > 0) {
      setSelectedParticipants(initParticipants);
      setFormData((prev) => ({
        ...prev,
        participants: initParticipants.map(p => ({
          kingId: p.kingId,
          role: p.role
        })),
      }));
    }
  }, [preselectedKingId, kings, dynasties, isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleAddParticipant = (participant) => {
    // Add to displayed participants
    setSelectedParticipants([...selectedParticipants, participant]);
    
    // Add minimal data to formData
    const minimalParticipant = {
      kingId: participant.kingId,
      role: participant.role || "participant"
    };
    
    setFormData({
      ...formData,
      participants: [...formData.participants, minimalParticipant]
    });
  };

  const handleRemoveParticipant = (participant) => {
    // Don't allow removal of preselected kings
    if (preselectedKingId && (participant.kingId === preselectedKingId || participant.id === preselectedKingId)) {
      return;
    }

    const kingId = participant.kingId || participant.id;
    
    // Remove from display participants
    const updatedParticipants = selectedParticipants.filter(p => 
      p.kingId !== kingId && p.id !== kingId
    );
    setSelectedParticipants(updatedParticipants);
    
    // Remove from data structure
    const updatedFormParticipants = formData.participants.filter(p => 
      p.kingId !== kingId
    );
    
    setFormData({
      ...formData,
      participants: updatedFormParticipants
    });
  };

  const handleUpdateParticipant = (updatedParticipant) => {
    // Update in display list
    const updatedParticipants = selectedParticipants.map(p => {
      if (p.kingId === updatedParticipant.kingId || p.id === updatedParticipant.kingId) {
        return { ...p, ...updatedParticipant };
      }
      return p;
    });
    setSelectedParticipants(updatedParticipants);
    
    // Update in data structure
    const updatedFormParticipants = formData.participants.map(p => {
      if (p.kingId === updatedParticipant.kingId) {
        return { 
          kingId: p.kingId,
          role: updatedParticipant.role
        };
      }
      return p;
    });
    
    setFormData({
      ...formData,
      participants: updatedFormParticipants
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "War name is required";
    }

    if (!formData.type) {
      newErrors.type = "Please select a war type";
    }

    if (!formData.startYear) {
      newErrors.startYear = "Start year is required";
    } else if (isNaN(parseInt(formData.startYear))) {
      newErrors.startYear = "Start year must be a number";
    }

    if (!formData.endYear) {
      newErrors.endYear = "End year is required";
    } else if (isNaN(parseInt(formData.endYear))) {
      newErrors.endYear = "End year must be a number";
    }

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

    if (
      !isNaN(startYearValue) &&
      !isNaN(endYearValue) &&
      startYearValue > endYearValue
    ) {
      newErrors.endYear = "End year must be after start year";
    }

    if (formData.participants.length < 1) {
      newErrors.participants = "At least one participant must be added";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Process one-time kings if any
    const kingIdsMap = new Map();
    for (const participant of selectedParticipants) {
      if (participant.isOneTime) {
        // Create real one-time king
        const newKing = await addOneTimeKing({
          name: participant.name,
          dynastyName: participant.dynastyName,
          color: generateRandomColor(),
        });
        kingIdsMap.set(participant.kingId, newKing.id);
      } else {
        kingIdsMap.set(participant.kingId, participant.kingId);
      }
    }

    // Replace temporary IDs with real ones and prepare final participants list with only essential data
    const finalParticipants = selectedParticipants.map((p) => ({
      kingId: kingIdsMap.has(p.kingId) ? kingIdsMap.get(p.kingId) : p.kingId,
      role: p.role,
    }));

    // Convert years to internal representation
    let startYearValue = parseInt(formData.startYear);
    let endYearValue = parseInt(formData.endYear);

    // Apply BCE conversion if needed
    if (startYearBce && !isNaN(startYearValue)) {
      startYearValue = -startYearValue + 1;
    }

    if (endYearBce && !isNaN(endYearValue)) {
      endYearValue = -endYearValue + 1;
    }

    // Create war data
    const warData = {
      ...formData,
      startYear: startYearValue,
      endYear: endYearValue,
      participants: finalParticipants,
    };

    // If editing, use the provided callback, otherwise add a new war
    if (isEditing && onSave) {
      onSave(warData);
    } else {
      addWar(warData);
    }

    if (onClose) onClose();
  };

  const warTypes = [
    { value: "Conquest", label: "Conquest" },
    { value: "Civil War", label: "Civil War" },
    { value: "Succession", label: "Succession" },
    { value: "Religious", label: "Religious" },
    { value: "Trade", label: "Trade" },
    { value: "Naval", label: "Naval" },
    { value: "Colonial", label: "Colonial" },
    { value: "Territorial", label: "Territorial" },
    { value: "Other", label: "Other" },
  ];

  const importanceLevels = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const participantRoles = [
    { value: "victor", label: "Victor" },
    { value: "defeated", label: "Defeated" },
    { value: "participant", label: "Participant" },
    { value: "ally", label: "Ally" },
    { value: "neutral", label: "Neutral Observer" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="text-xl font-bold mb-4 dark:text-white">
          Add New War/Conflict
        </div>
      )}

      <FormInput
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        label="War/Conflict Name"
        placeholder="e.g., Hundred Years' War, First Punic War"
        error={errors.name}
        isRequired={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={warTypes}
          label="War Type"
          error={errors.type}
          isRequired={true}
        />

        <FormSelect
          id="importance"
          name="importance"
          value={formData.importance}
          onChange={handleChange}
          options={importanceLevels}
          label="Importance"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          id="startYear"
          name="startYear"
          value={formData.startYear}
          onChange={handleChange}
          isBce={startYearBce}
          onBceChange={setStartYearBce}
          label="Start Year"
          placeholder="e.g., 1337"
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
          label="End Year"
          placeholder="e.g., 1453"
          error={errors.endYear}
          isRequired={true}
        />
      </div>

      <FormInput
        id="location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        label="Location"
        placeholder="e.g., Western Europe, Mediterranean"
      />

      <FormTextArea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        label="Description"
        placeholder="Brief description of the war/conflict"
      />

      {/* Participants Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium dark:text-white">Participants</h3>
        </div>

        <RulerPicker
          selectedRulers={selectedParticipants}
          onAddRuler={handleAddParticipant}
          onRemoveRuler={handleRemoveParticipant}
          onUpdateRuler={handleUpdateParticipant}
          error={errors.participants}
          preselectedKingId={preselectedKingId}
          showRoles={true}
          roleOptions={participantRoles}
        />
      </div>

      <FormActions
        onCancel={onClose}
        isEditing={isEditing}
        submitLabel={isEditing ? "Save Changes" : "Add War/Conflict"}
      />
    </form>
  );
};

export default AddWarForm;