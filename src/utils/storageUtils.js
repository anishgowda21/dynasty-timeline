/**
 * Storage utilities for saving and retrieving data from localStorage
 */

// In-memory cache to reduce localStorage reads
const memoryCache = new Map();

// Constants
const APP_KEYS = ['dynasties', 'kings', 'events', 'wars', 'uiSettings'];
const STORAGE_PREFIX = 'dynasty-timeline-';
const COMPRESSION_THRESHOLD = 10000; // Bytes, ~10KB

// Simple LZ-based string compression for large data
const compressString = (str) => {
  if (!str || str.length < COMPRESSION_THRESHOLD) return str;
  
  try {
    // Create a dictionary of common patterns
    let dict = {};
    let result = [];
    let phrase = "";
    let code = 256;
    
    // Initialize dictionary with ASCII characters
    for (let i = 0; i < 256; i++) {
      dict[String.fromCharCode(i)] = i;
    }
    
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      let newPhrase = phrase + char;
      
      if (dict[newPhrase] !== undefined) {
        phrase = newPhrase;
      } else {
        result.push(dict[phrase]);
        dict[newPhrase] = code++;
        phrase = char;
      }
    }
    
    if (phrase !== "") {
      result.push(dict[phrase]);
    }
    
    // Convert to string with a marker to indicate compression
    return "C:" + result.join(",");
  } catch (e) {
    console.warn("Compression failed, using uncompressed data", e);
    return str;
  }
};

// Decompress a compressed string
const decompressString = (str) => {
  if (!str || !str.startsWith("C:")) return str;
  
  try {
    // Remove the compression marker
    const compressedData = str.substring(2).split(",").map(Number);
    
    let dict = {};
    let result = [];
    let code = 256;
    
    // Initialize dictionary with ASCII characters
    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i);
    }
    
    let oldPhrase = String.fromCharCode(compressedData[0]);
    result.push(oldPhrase);
    
    for (let i = 1; i < compressedData.length; i++) {
      let currentCode = compressedData[i];
      let phrase;
      
      if (dict[currentCode] !== undefined) {
        phrase = dict[currentCode];
      } else if (currentCode === code) {
        phrase = oldPhrase + oldPhrase[0];
      } else {
        throw new Error("Invalid compressed data");
      }
      
      result.push(phrase);
      dict[code++] = oldPhrase + phrase[0];
      oldPhrase = phrase;
    }
    
    return result.join("");
  } catch (e) {
    console.warn("Decompression failed, returning original data", e);
    return str;
  }
};

// Get prefixed key for localStorage
const getPrefixedKey = (key) => {
  return `${STORAGE_PREFIX}${key}`;
};

// Save data to localStorage with optional compression
export const saveToLocalStorage = (key, data) => {
  try {
    const prefixedKey = getPrefixedKey(key);
    const serializedData = JSON.stringify(data);
    
    // Compress if data is large
    const storageValue = serializedData.length > COMPRESSION_THRESHOLD 
      ? compressString(serializedData) 
      : serializedData;
    
    // Update memory cache
    memoryCache.set(key, data);
    
    // Save to localStorage
    localStorage.setItem(prefixedKey, storageValue);
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    
    // Try to save without compression if we hit storage limits
    if (error.name === 'QuotaExceededError') {
      try {
        const prefixedKey = getPrefixedKey(key);
        localStorage.setItem(prefixedKey, JSON.stringify(data));
        return true;
      } catch (fallbackError) {
        console.error(`Fallback save for ${key} failed:`, fallbackError);
      }
    }
    
    return false;
  }
};

// Get data from localStorage with caching
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    // Check memory cache first
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    
    const prefixedKey = getPrefixedKey(key);
    const item = localStorage.getItem(prefixedKey);
    
    if (!item) return defaultValue;
    
    // Check if data is compressed
    const parsedData = item.startsWith("C:") 
      ? JSON.parse(decompressString(item)) 
      : JSON.parse(item);
    
    // Update memory cache
    memoryCache.set(key, parsedData);
    
    return parsedData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Clear specific data from localStorage
export const clearFromLocalStorage = (key) => {
  try {
    const prefixedKey = getPrefixedKey(key);
    localStorage.removeItem(prefixedKey);
    
    // Clear from memory cache
    memoryCache.delete(key);
    
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// Clear all app data from localStorage
export const clearAllLocalStorage = () => {
  try {
    // Remove only keys related to our app
    APP_KEYS.forEach(key => {
      const prefixedKey = getPrefixedKey(key);
      localStorage.removeItem(prefixedKey);
    });
    
    // Clear memory cache
    memoryCache.clear();
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Clear memory cache but keep localStorage
export const clearMemoryCache = () => {
  memoryCache.clear();
};

// Get the storage usage information
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    let appSize = 0;
    const appPrefixedKeys = APP_KEYS.map(key => getPrefixedKey(key));
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = (key.length + value.length) * 2; // Approximate size in bytes
      
      totalSize += size;
      
      if (appPrefixedKeys.includes(key)) {
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
      percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2), // 5MB is typical localStorage limit
      memoryCache: {
        entries: memoryCache.size,
        keys: Array.from(memoryCache.keys())
      }
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return null;
  }
};
