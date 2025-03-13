import { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { sampleData } from "../data/sampleData";
import { saveToLocalStorage, getFromLocalStorage } from "../utils/storageUtils";
import { generateRandomColor, generateSeededColor } from "../utils/colorUtils";
import { parseYear } from "../utils/dateUtils";

const DynastyContext = createContext();

export const useDynasty = () => {
  return useContext(DynastyContext);
};

// Utility function to create indexed maps from arrays for faster lookups
const createEntityMap = (entities) => {
  return entities.reduce((map, entity) => {
    map[entity.id] = entity;
    return map;
  }, {});
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

  // Memoized entity maps for faster lookups
  const dynastyMap = useMemo(() => createEntityMap(dynasties), [dynasties]);
  const kingMap = useMemo(() => createEntityMap(kings), [kings]);
  
  // Memoized kings by dynasty for faster filtering
  const kingsByDynasty = useMemo(() => {
    return kings.reduce((map, king) => {
      if (!map[king.dynastyId]) {
        map[king.dynastyId] = [];
      }
      map[king.dynastyId].push(king);
      return map;
    }, {});
  }, [kings]);

  // Memoized events by king for faster filtering
  const eventsByKing = useMemo(() => {
    return events.reduce((map, event) => {
      event.kingIds.forEach(kingId => {
        if (!map[kingId]) {
          map[kingId] = [];
        }
        map[kingId].push(event);
      });
      return map;
    }, {});
  }, [events]);

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
      // Debounce localStorage updates to prevent excessive writes
      const timeoutId = setTimeout(() => {
        saveToLocalStorage("dynasties", dynasties);
        saveToLocalStorage("kings", kings);
        saveToLocalStorage("events", events);
        saveToLocalStorage("wars", wars);
        saveToLocalStorage("uiSettings", uiSettings);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [dynasties, kings, events, wars, uiSettings, loading]);

  // Validation function - separated from the effect for better organization
  const validateData = useCallback(() => {
    if (loading || uiSettings.validationLevel === "none") return [];

    const warnings = [];

    // Check kings against their dynasties
    kings.forEach((king) => {
      const dynasty = dynastyMap[king.dynastyId];
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
        const king = kingMap[kingId];
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
          const king = kingMap[participant.kingId];
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

    return warnings;
  }, [dynasties, kings, events, wars, dynastyMap, kingMap, loading, uiSettings.validationLevel]);

  // Run validation when data changes
  useEffect(() => {
    const warnings = validateData();
    setValidationWarnings(warnings);
  }, [validateData]);

  // Memoized CRUD operations to prevent unnecessary re-renders
  const addDynasty = useCallback((dynasty) => {
    // Generate random color if none provided
    const dynastyColor = dynasty.color || generateRandomColor();

    const newDynasty = {
      ...dynasty,
      id: crypto.randomUUID(),
      color: dynastyColor,
      createdAt: new Date().toISOString(),
    };

    setDynasties(prevDynasties => {
      const newDynasties = [...prevDynasties, newDynasty];
      
      // Update UI settings to include this dynasty in selected dynasties if it's the first one
      if (prevDynasties.length === 0) {
        setUiSettings(prev => ({
          ...prev,
          selectedDynasties: [newDynasty.id],
        }));
      }
      
      return newDynasties;
    });

    return newDynasty;
  }, []);

  const updateDynasty = useCallback((id, updatedData) => {
    setDynasties(prevDynasties => 
      prevDynasties.map((dynasty) =>
        dynasty.id === id ? { ...dynasty, ...updatedData } : dynasty
      )
    );
  }, []);

  const deleteDynasty = useCallback((id) => {
    // Get kings belonging to this dynasty before deleting
    const dynastyKingIds = kings
      .filter(king => king.dynastyId === id)
      .map(king => king.id);
    
    // Batch state updates for better performance
    // First, delete all kings belonging to this dynasty
    if (dynastyKingIds.length > 0) {
      setKings(prevKings => prevKings.filter(king => king.dynastyId !== id));
      
      // Remove events referencing these kings
      setEvents(prevEvents => 
        prevEvents.filter(event => 
          !event.kingIds.some(kingId => dynastyKingIds.includes(kingId))
        )
      );
      
      // Remove wars referencing these kings
      setWars(prevWars => 
        prevWars.filter(war => 
          !war.participants.some(p => dynastyKingIds.includes(p.kingId))
        )
      );
    }
    
    // Then delete the dynasty
    setDynasties(prevDynasties => prevDynasties.filter(dynasty => dynasty.id !== id));

    // Remove from selected dynasties if present
    setUiSettings(prev => {
      if (prev.selectedDynasties.includes(id)) {
        return {
          ...prev,
          selectedDynasties: prev.selectedDynasties.filter(
            (dynastyId) => dynastyId !== id
          ),
        };
      }
      return prev;
    });
  }, [kings]);

  const addKing = useCallback((king) => {
    // Find related dynasty to get its color for the king
    const relatedDynasty = dynastyMap[king.dynastyId];
    const dynastyColor = relatedDynasty
      ? relatedDynasty.color
      : generateRandomColor();

    const newKing = {
      ...king,
      id: crypto.randomUUID(),
      color: king.color || dynastyColor,
      createdAt: new Date().toISOString(),
    };

    setKings(prevKings => [...prevKings, newKing]);
    return newKing;
  }, [dynastyMap]);

  const updateKing = useCallback((id, updatedData) => {
    setKings(prevKings => 
      prevKings.map((king) => (king.id === id ? { ...king, ...updatedData } : king))
    );
  }, []);

  const deleteKing = useCallback((id) => {
    // Batch updates for better performance
    setEvents(prevEvents => prevEvents.filter(event => !event.kingIds.includes(id)));
    setWars(prevWars => prevWars.filter(war => !war.participants.some(p => p.kingId === id)));
    setKings(prevKings => prevKings.filter(king => king.id !== id));
  }, []);

  const addEvent = useCallback((event) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id, updatedData) => {
    setEvents(prevEvents => {
      const newEvents = prevEvents.map((event) =>
        event.id === id ? { ...event, ...updatedData } : event
      );
      
      // Schedule cleanup to run after state update
      setTimeout(() => cleanupOrphanedOneTimeKings(newEvents), 0);
      
      return newEvents;
    });
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents(prevEvents => {
      const newEvents = prevEvents.filter((event) => event.id !== id);
      
      // Schedule cleanup to run after state update
      setTimeout(() => cleanupOrphanedOneTimeKings(newEvents), 0);
      
      return newEvents;
    });
  }, []);

  // War management functions
  const addWar = useCallback((war) => {
    const newWar = {
      ...war,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setWars(prevWars => [...prevWars, newWar]);
    return newWar;
  }, []);

  const updateWar = useCallback((id, updatedData) => {
    setWars(prevWars => {
      const newWars = prevWars.map((war) =>
        war.id === id ? { ...war, ...updatedData } : war
      );
      
      // Schedule cleanup to run after state update
      setTimeout(() => cleanupOrphanedOneTimeKings(events, newWars), 0);
      
      return newWars;
    });
  }, [events]);

  const deleteWar = useCallback((id) => {
    setWars(prevWars => {
      const newWars = prevWars.filter((war) => war.id !== id);
      
      // Schedule cleanup to run after state update
      setTimeout(() => cleanupOrphanedOneTimeKings(), 0);
      
      return newWars;
    });
  }, []);

  // UI Settings Functions - memoized
  const toggleDynastySelection = useCallback((dynastyId) => {
    setUiSettings(prev => ({
      ...prev,
      selectedDynasties: prev.selectedDynasties.includes(dynastyId)
        ? prev.selectedDynasties.filter((id) => id !== dynastyId)
        : [...prev.selectedDynasties, dynastyId],
    }));
  }, []);

  const setSelectedDynasties = useCallback((dynastyIds) => {
    setUiSettings(prev => ({
      ...prev,
      selectedDynasties: dynastyIds,
    }));
  }, []);

  const toggleShowIncompleteTimelines = useCallback(() => {
    setUiSettings(prev => ({
      ...prev,
      showIncompleteTimelines: !prev.showIncompleteTimelines,
    }));
  }, []);

  const setValidationLevel = useCallback((level) => {
    setUiSettings(prev => ({
      ...prev,
      validationLevel: level,
    }));
  }, []);

  // Export data as JSON - memoized
  const exportData = useCallback(() => {
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
  }, [dynasties, kings, events, wars, uiSettings]);

  // Import data from JSON - memoized
  const importData = useCallback((importedData) => {
    if (
      !importedData.dynasties ||
      !importedData.kings ||
      !importedData.events ||
      !importedData.wars ||
      !importedData.uiSettings
    ) {
      throw new Error("Invalid data format");
    }

    // Batch state updates
    setDynasties(importedData.dynasties);
    setKings(importedData.kings);
    setEvents(importedData.events);
    setWars(importedData.wars);
    setUiSettings(importedData.uiSettings);
  }, []);

  // Reset to sample data - memoized
  const resetToSampleData = useCallback(() => {
    // Batch state updates
    setDynasties(sampleData.dynasties);
    setKings(sampleData.kings);
    setEvents(sampleData.events);
    setWars(sampleData.wars || []);
    setUiSettings({
      selectedDynasties: sampleData.dynasties.map((d) => d.id),
      showIncompleteTimelines: true,
      validationLevel: "warn",
    });
  }, []);

  // Clear all data - memoized
  const clearAllData = useCallback(() => {
    // Batch state updates
    setDynasties([]);
    setKings([]);
    setEvents([]);
    setWars([]);
    setUiSettings(prev => ({
      ...prev,
      selectedDynasties: [],
    }));
  }, []);

  // Add a one-time king - memoized
  const addOneTimeKing = useCallback((kingData) => {
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

    setKings(prevKings => [...prevKings, newKing]);
    return newKing;
  }, []);

  // Optimized cleanup function
  const cleanupOrphanedOneTimeKings = useCallback((
    latestEvents = events,
    latestWars = wars
  ) => {
    // Find all one-time kings
    const oneTimeKings = kings.filter((king) => king.isOneTime === true);
    if (oneTimeKings.length === 0) return; // Early return if no one-time kings

    // Create a set of referenced king IDs for faster lookups
    const referencedKingIds = new Set();
    
    // Check events
    for (const event of latestEvents) {
      if (event.kingIds) {
        for (const kingId of event.kingIds) {
          referencedKingIds.add(kingId);
        }
      }
    }
    
    // Check wars
    for (const war of latestWars) {
      if (war.participants) {
        for (const participant of war.participants) {
          if (participant.kingId) {
            referencedKingIds.add(participant.kingId);
          }
        }
      }
    }

    // Identify kings that are no longer referenced
    const kingsToDelete = oneTimeKings
      .filter(king => !referencedKingIds.has(king.id))
      .map(king => king.id);

    // Remove unreferenced kings from state
    if (kingsToDelete.length > 0) {
      setKings(prevKings => prevKings.filter(king => !kingsToDelete.includes(king.id)));
    }
  }, [kings, events, wars]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    dynasties,
    kings,
    events,
    wars,
    loading,
    uiSettings,
    validationWarnings,
    // Maps for faster lookups
    dynastyMap,
    kingMap,
    kingsByDynasty,
    eventsByKing,
    // CRUD operations
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
    // UI settings
    toggleDynastySelection,
    setSelectedDynasties,
    toggleShowIncompleteTimelines,
    setValidationLevel,
    // Data management
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
    addOneTimeKing,
  }), [
    dynasties, kings, events, wars, loading, uiSettings, validationWarnings,
    dynastyMap, kingMap, kingsByDynasty, eventsByKing,
    addDynasty, updateDynasty, deleteDynasty,
    addKing, updateKing, deleteKing,
    addEvent, updateEvent, deleteEvent,
    addWar, updateWar, deleteWar,
    toggleDynastySelection, setSelectedDynasties,
    toggleShowIncompleteTimelines, setValidationLevel,
    exportData, importData, resetToSampleData, clearAllData, addOneTimeKing
  ]);

  return (
    <DynastyContext.Provider value={value}>{children}</DynastyContext.Provider>
  );
};
