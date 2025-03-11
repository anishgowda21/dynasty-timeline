import { createContext, useState, useContext, useEffect } from "react";
import { sampleData } from "../data/sampleData";
import { saveToLocalStorage, getFromLocalStorage } from "../utils/storageUtils";
import { generateRandomColor, generateSeededColor } from "../utils/colorUtils";
import { parseYear } from "../utils/dateUtils";

const DynastyContext = createContext();

export const useDynasty = () => {
  return useContext(DynastyContext);
};

export const DynastyProvider = ({ children }) => {
  const [dynasties, setDynasties] = useState([]);
  const [kings, setKings] = useState([]);
  const [events, setEvents] = useState([]);
  const [wars, setWars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiSettings, setUiSettings] = useState({
    selectedDynasties: [], // for filtering timeline view
    showIncompleteTimelines: true, // show entities with incomplete dates
    validationLevel: "warn", // 'none', 'warn', 'strict'
  });
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const storedDynasties = getFromLocalStorage("dynasties");
        const storedKings = getFromLocalStorage("kings");
        const storedEvents = getFromLocalStorage("events");
        const storedWars = getFromLocalStorage("wars", []);
        const storedUISettings = getFromLocalStorage("uiSettings");

        if (storedDynasties && storedKings && storedEvents) {
          setDynasties(storedDynasties);
          setKings(storedKings);
          setEvents(storedEvents);
          setWars(storedWars);

          if (storedUISettings) {
            setUiSettings(storedUISettings);
          }
        } else {
          // Use sample data if no localStorage data exists
          setDynasties(sampleData.dynasties);
          setKings(sampleData.kings);
          setEvents(sampleData.events);
          setWars(sampleData.wars || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setDynasties(sampleData.dynasties);
        setKings(sampleData.kings);
        setEvents(sampleData.events);
        setWars(sampleData.wars || []);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage("dynasties", dynasties);
      saveToLocalStorage("kings", kings);
      saveToLocalStorage("events", events);
      saveToLocalStorage("wars", wars);
      saveToLocalStorage("uiSettings", uiSettings);
    }
  }, [dynasties, kings, events, wars, uiSettings, loading]);

  // Validate data relationships
  useEffect(() => {
    if (loading || uiSettings.validationLevel === "none") return;

    const warnings = [];

    // Check kings against their dynasties
    kings.forEach((king) => {
      const dynasty = dynasties.find((d) => d.id === king.dynastyId);
      if (dynasty) {
        // King rules before dynasty starts
        if (king.startYear < dynasty.startYear) {
          warnings.push({
            id: `king-before-dynasty-${king.id}`,
            type: "king",
            level: "warning",
            message: `${king.name} began rule in ${king.startYear}, before the ${dynasty.name} dynasty started in ${dynasty.startYear}.`,
            relatedIds: [king.id, dynasty.id],
          });
        }

        // King rules after dynasty ends
        if (dynasty.endYear && king.endYear && king.endYear > dynasty.endYear) {
          warnings.push({
            id: `king-after-dynasty-${king.id}`,
            type: "king",
            level: "warning",
            message: `${king.name} ended rule in ${king.endYear}, after the ${dynasty.name} dynasty ended in ${dynasty.endYear}.`,
            relatedIds: [king.id, dynasty.id],
          });
        }
      }
    });

    // Check events against their kings
    events.forEach((event) => {
      // Check for missing date
      if (!event.date || event.date.trim() === "") {
        warnings.push({
          id: `event-missing-date-${event.id}`,
          type: "event",
          level: "warning",
          message: `The event "${event.name}" has no date specified.`,
          relatedIds: [event.id],
        });
        return; // Skip further validation for this event
      }

      // Parse event year from date using parseYear utility
      const eventYear = parseYear(event.date);

      // Check if parsing failed
      if (eventYear === null) {
        warnings.push({
          id: `event-invalid-date-${event.id}`,
          type: "event",
          level: "warning",
          message: `The event "${event.name}" has an invalid date format: ${event.date}`,
          relatedIds: [event.id],
        });
        return; // Skip further validation for this event
      }

      event.kingIds.forEach((kingId) => {
        const king = kings.find((k) => k.id === kingId);
        if (king) {
          // Event before king's rule
          if (eventYear < king.startYear) {
            warnings.push({
              id: `event-before-king-${event.id}-${kingId}`,
              type: "event",
              level: "warning",
              message: `The event "${event.name}" (${eventYear}) happened before ${king.name} began rule in ${king.startYear}.`,
              relatedIds: [event.id, kingId],
              data: {
                eventName: event.name,
                eventId: event.id,
                eventDate: eventYear,
                kingName: king.name,
                kingId: king.id,
                kingStart: king.startYear,
                kingEnd: king.endYear,
              },
            });
          }

          // Event after king's rule
          if (king.endYear && eventYear > king.endYear) {
            warnings.push({
              id: `event-after-king-${event.id}-${kingId}`,
              type: "event",
              level: "warning",
              message: `The event "${event.name}" (${eventYear}) happened after ${king.name} ended rule in ${king.endYear}.`,
              relatedIds: [event.id, kingId],
              data: {
                eventName: event.name,
                eventId: event.id,
                eventDate: eventYear,
                kingName: king.name,
                kingId: king.id,
                kingStart: king.startYear,
                kingEnd: king.endYear,
              },
            });
          }
        }
      });
    });

    // Check wars
    wars.forEach((war) => {
      // Check for valid date ranges
      if (war.startYear !== undefined && war.endYear !== undefined) {
        // Validate start year is before end year
        if (war.startYear > war.endYear) {
          warnings.push({
            id: `war-invalid-range-${war.id}`,
            type: "war",
            level: "warning",
            message: `The war "${war.name}" has an invalid date range: ${war.startYear} to ${war.endYear}`,
            relatedIds: [war.id],
          });
        }
      }

      // Check participant kings and their reigns
      war.participants.forEach((participant) => {
        if (participant.kingId) {
          const king = kings.find((k) => k.id === participant.kingId);
          if (!king) {
            // Missing king validation
            warnings.push({
              id: `war-missing-king-${war.id}-${participant.kingId}`,
              type: "war",
              level: "error",
              message: `The war "${war.name}" references a king that doesn't exist.`,
              relatedIds: [war.id],
            });
          } else if (war.startYear !== undefined && war.endYear !== undefined) {
            // Only perform date validations if we have a valid king and valid war dates

            // War started before king's rule
            if (war.startYear < king.startYear) {
              warnings.push({
                id: `war-before-king-${war.id}-${participant.kingId}`,
                type: "war",
                level: "warning",
                message: `The war "${war.name}" (${war.startYear} - ${war.endYear}) started before ${king.name} began rule in ${king.startYear}.`,
                relatedIds: [war.id, participant.kingId],
                data: {
                  warName: war.name,
                  warId: war.id,
                  warStart: war.startYear,
                  warEnd: war.endYear,
                  kingName: king.name,
                  kingId: king.id,
                  kingStart: king.startYear,
                  kingEnd: king.endYear,
                },
              });
            }

            // War ended after king's rule
            if (king.endYear && war.endYear > king.endYear) {
              warnings.push({
                id: `war-after-king-${war.id}-${participant.kingId}`,
                type: "war",
                level: "warning",
                message: `The war "${war.name}" (${war.startYear} - ${war.endYear}) ended after ${king.name} ended rule in ${king.endYear}.`,
                relatedIds: [war.id, participant.kingId],
                data: {
                  warName: war.name,
                  warId: war.id,
                  warStart: war.startYear,
                  warEnd: war.endYear,
                  kingName: king.name,
                  kingId: king.id,
                  kingStart: king.startYear,
                  kingEnd: king.endYear,
                },
              });
            }
          }
        }
      });
    });

    setValidationWarnings(warnings);
  }, [dynasties, kings, events, wars, loading, uiSettings.validationLevel]);

  const addDynasty = (dynasty) => {
    // Generate random color if none provided
    const dynastyColor = dynasty.color || generateRandomColor();

    const newDynasty = {
      ...dynasty,
      id: crypto.randomUUID(),
      color: dynastyColor,
      createdAt: new Date().toISOString(),
    };

    const newDynasties = [...dynasties, newDynasty];
    setDynasties(newDynasties);

    // Update UI settings to include this dynasty in selected dynasties if it's the first one
    if (dynasties.length === 0) {
      setUiSettings({
        ...uiSettings,
        selectedDynasties: [newDynasty.id],
      });
    }

    return newDynasty;
  };

  const updateDynasty = (id, updatedData) => {
    setDynasties(
      dynasties.map((dynasty) =>
        dynasty.id === id ? { ...dynasty, ...updatedData } : dynasty
      )
    );
  };

  const deleteDynasty = (id) => {
    // First, delete all kings belonging to this dynasty
    const dynastyKings = kings.filter((king) => king.dynastyId === id);
    dynastyKings.forEach((king) => deleteKing(king.id));

    // Then delete the dynasty
    setDynasties(dynasties.filter((dynasty) => dynasty.id !== id));

    // Remove from selected dynasties if present
    if (uiSettings.selectedDynasties.includes(id)) {
      setUiSettings({
        ...uiSettings,
        selectedDynasties: uiSettings.selectedDynasties.filter(
          (dynastyId) => dynastyId !== id
        ),
      });
    }
  };

  const addKing = (king) => {
    // Find related dynasty to get its color for the king
    const relatedDynasty = dynasties.find((d) => d.id === king.dynastyId);
    const dynastyColor = relatedDynasty
      ? relatedDynasty.color
      : generateRandomColor();

    const newKing = {
      ...king,
      id: crypto.randomUUID(),
      color: king.color || dynastyColor,
      createdAt: new Date().toISOString(),
    };

    setKings([...kings, newKing]);
    return newKing;
  };

  const updateKing = (id, updatedData) => {
    setKings(
      kings.map((king) => (king.id === id ? { ...king, ...updatedData } : king))
    );
  };

  const deleteKing = (id) => {
    // Delete all events related to this king
    setEvents(events.filter((event) => !event.kingIds.includes(id)));

    // Delete all wars related to this king
    setWars(
      wars.filter((war) => !war.participants.some((p) => p.kingId === id))
    );

    // Delete the king
    setKings(kings.filter((king) => king.id !== id));
  };

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setEvents([...events, newEvent]);
    return newEvent;
  };

  const updateEvent = (id, updatedData) => {
    const newEvents = events.map((event) =>
      event.id === id ? { ...event, ...updatedData } : event
    );
    setEvents(newEvents);
    cleanupOrphanedOneTimeKings(newEvents);
  };

  const deleteEvent = (id) => {
    const newEvents = events.filter((event) => event.id !== id);
    setEvents(newEvents);
    cleanupOrphanedOneTimeKings(newEvents);
  };

  // War management functions
  const addWar = (war) => {
    const newWar = {
      ...war,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setWars([...wars, newWar]);
    return newWar;
  };

  const updateWar = (id, updatedData) => {
    const newWars = wars.map((war) =>
      war.id === id ? { ...war, ...updatedData } : war
    );
    setWars(newWars);
    cleanupOrphanedOneTimeKings(events, newWars);
  };

  const deleteWar = (id) => {
    const newWars = wars.filter((war) => war.id !== id);
    setWars(newWars);
    cleanupOrphanedOneTimeKings();
  };

  // UI Settings Functions
  const toggleDynastySelection = (dynastyId) => {
    setUiSettings({
      ...uiSettings,
      selectedDynasties: uiSettings.selectedDynasties.includes(dynastyId)
        ? uiSettings.selectedDynasties.filter((id) => id !== dynastyId)
        : [...uiSettings.selectedDynasties, dynastyId],
    });
  };

  const setSelectedDynasties = (dynastyIds) => {
    setUiSettings({
      ...uiSettings,
      selectedDynasties: dynastyIds,
    });
  };

  const toggleShowIncompleteTimelines = () => {
    setUiSettings({
      ...uiSettings,
      showIncompleteTimelines: !uiSettings.showIncompleteTimelines,
    });
  };

  const setValidationLevel = (level) => {
    setUiSettings({
      ...uiSettings,
      validationLevel: level,
    });
  };



  // Export data as JSON
  const exportData = () => {
    const data = {
      dynasties,
      kings,
      events,
      wars,
      uiSettings,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `dynasty-timeline-export-${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import data from JSON file
  const importData = (importedData) => {
    if (
      !importedData.dynasties ||
      !importedData.kings ||
      !importedData.events ||
      !importedData.wars ||
      !importedData.uiSettings
    ) {
      throw new Error("Invalid data format");
    }

    setDynasties(importedData.dynasties);
    setKings(importedData.kings);
    setEvents(importedData.events);
    setWars(importedData.wars);

    setUiSettings(importedData.uiSettings);
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setDynasties(sampleData.dynasties);
    setKings(sampleData.kings);
    setEvents(sampleData.events);
    setWars(sampleData.wars || []);

    // Reset UI settings as well
    setUiSettings({
      selectedDynasties: sampleData.dynasties.map((d) => d.id),
      showIncompleteTimelines: true,
      validationLevel: "warn",
    });
  };

  // Clear all data
  const clearAllData = () => {
    setDynasties([]);
    setKings([]);
    setEvents([]);
    setWars([]);

    // Reset selected dynasties to empty
    setUiSettings({
      ...uiSettings,
      selectedDynasties: [],
    });
  };

  // Add a one-time king and war
  const addOneTimeKing = (kingData) => {
    // Generate a unique ID for this one-time king
    const kingId = crypto.randomUUID();

    const newKing = {
      id: kingId,
      name: kingData.name,
      dynastyId: kingData.dynastyId || null,
      startYear: kingData.startYear || null,
      endYear: kingData.endYear || null,
      isOneTime: true, // Flag to mark this as a one-time king
      color: kingData.color || generateSeededColor(kingData.name),
      dynastyName: kingData.dynastyName,
      createdAt: new Date().toISOString(),
    };

    setKings([...kings, newKing]);
    return newKing;
  };

  const cleanupOrphanedOneTimeKings = (
    latestEvents = events,
    latestWars = wars
  ) => {
    // Find all one-time kings
    const oneTimeKings = kings.filter((king) => king.isOneTime === true);

    // Identify kings that are no longer referenced
    const kingsToDelete = oneTimeKings
      .filter((king) => {
        const isReferencedInEvents = latestEvents.some(
          (event) => event.kingIds && event.kingIds.includes(king.id)
        );
        const isReferencedInWars = latestWars.some(
          (war) =>
            war.participants &&
            war.participants.some((p) => p.kingId === king.id)
        );
        return !isReferencedInEvents && !isReferencedInWars;
      })
      .map((king) => king.id);

    // Remove unreferenced kings from state
    if (kingsToDelete.length > 0) {
      setKings((prevKings) =>
        prevKings.filter((king) => !kingsToDelete.includes(king.id))
      );
    }
  };

  const value = {
    dynasties,
    kings,
    events,
    wars,
    loading,
    uiSettings,
    validationWarnings,
    addDynasty,
    updateDynasty,
    deleteDynasty,
    addKing,
    updateKing,
    deleteKing,
    addEvent,
    updateEvent,
    deleteEvent,
    addWar,
    updateWar,
    deleteWar,
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
    addOneTimeKing,
    toggleDynastySelection,
    setSelectedDynasties,
    toggleShowIncompleteTimelines,
    setValidationLevel,
  };

  return (
    <DynastyContext.Provider value={value}>{children}</DynastyContext.Provider>
  );
};
