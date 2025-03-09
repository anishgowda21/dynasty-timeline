/**
 * Storage utilities for saving and retrieving data from localStorage
 */

// Save data to localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Get data from localStorage
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Clear specific data from localStorage
export const clearFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// Clear all app data from localStorage
export const clearAllLocalStorage = () => {
  try {
    // Get all localStorage keys
    const keysToKeep = [];
    
    // Remove only keys related to our app (dynasties, kings, events)
    const appKeys = ['dynasties', 'kings', 'events', 'uiSettings'];
    
    appKeys.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Get the storage usage information
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    let appSize = 0;
    const appKeys = ['dynasties', 'kings', 'events', 'uiSettings'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = (key.length + value.length) * 2; // Approximate size in bytes
      
      totalSize += size;
      
      if (appKeys.includes(key)) {
        appSize += size;
      }
    }
    
    return {
      total: {
        bytes: totalSize,
        kb: (totalSize / 1024).toFixed(2),
        mb: (totalSize / (1024 * 1024)).toFixed(2)
      },
      app: {
        bytes: appSize,
        kb: (appSize / 1024).toFixed(2),
        mb: (appSize / (1024 * 1024)).toFixed(2)
      },
      percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) // 5MB is typical localStorage limit
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return null;
  }
};
