import { createContext, useState, useContext, useEffect } from 'react';
import { sampleData } from '../data/sampleData';

const DynastyContext = createContext();

export const useDynasty = () => {
  return useContext(DynastyContext);
};

export const DynastyProvider = ({ children }) => {
  const [dynasties, setDynasties] = useState([]);
  const [kings, setKings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const storedDynasties = localStorage.getItem('dynasties');
        const storedKings = localStorage.getItem('kings');
        const storedEvents = localStorage.getItem('events');

        if (storedDynasties && storedKings && storedEvents) {
          setDynasties(JSON.parse(storedDynasties));
          setKings(JSON.parse(storedKings));
          setEvents(JSON.parse(storedEvents));
        } else {
          // Use sample data if no localStorage data exists
          setDynasties(sampleData.dynasties);
          setKings(sampleData.kings);
          setEvents(sampleData.events);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setDynasties(sampleData.dynasties);
        setKings(sampleData.kings);
        setEvents(sampleData.events);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('dynasties', JSON.stringify(dynasties));
      localStorage.setItem('kings', JSON.stringify(kings));
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [dynasties, kings, events, loading]);

  const addDynasty = (dynasty) => {
    const newDynasty = {
      ...dynasty,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setDynasties([...dynasties, newDynasty]);
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
  };

  const addKing = (king) => {
    const newKing = {
      ...king,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setKings([...kings, newKing]);
    return newKing;
  };

  const updateKing = (id, updatedData) => {
    setKings(
      kings.map((king) => 
        king.id === id ? { ...king, ...updatedData } : king
      )
    );
  };

  const deleteKing = (id) => {
    // First, delete all events related to this king
    setEvents(events.filter((event) => !event.kingIds.includes(id)));
    
    // Then delete the king
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
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, ...updatedData } : event
      )
    );
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  // Export data as JSON
  const exportData = () => {
    const data = {
      dynasties,
      kings,
      events,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `dynasty-timeline-export-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from JSON file
  const importData = async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.dynasties || !importedData.kings || !importedData.events) {
              reject(new Error('Invalid data format'));
              return;
            }
            
            setDynasties(importedData.dynasties);
            setKings(importedData.kings);
            setEvents(importedData.events);
            
            resolve({
              success: true,
              message: 'Data imported successfully',
              data: importedData
            });
          } catch (error) {
            reject(new Error('Failed to parse JSON file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setDynasties(sampleData.dynasties);
    setKings(sampleData.kings);
    setEvents(sampleData.events);
  };

  // Clear all data
  const clearAllData = () => {
    setDynasties([]);
    setKings([]);
    setEvents([]);
  };

  const value = {
    dynasties,
    kings,
    events,
    loading,
    addDynasty,
    updateDynasty,
    deleteDynasty,
    addKing,
    updateKing,
    deleteKing,
    addEvent,
    updateEvent,
    deleteEvent,
    exportData,
    importData,
    resetToSampleData,
    clearAllData
  };

  return (
    <DynastyContext.Provider value={value}>
      {children}
    </DynastyContext.Provider>
  );
};
