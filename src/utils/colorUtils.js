/**
 * Utilities for color generation and manipulation
 */

// Generate a random color
export const generateRandomColor = () => {
  // Generate slightly muted colors that are still visually distinct
  const h = Math.floor(Math.random() * 360); // Hue: 0-359
  const s = Math.floor(40 + Math.random() * 40); // Saturation: 40-80%
  const l = Math.floor(45 + Math.random() * 15); // Lightness: 45-60%
  
  // Convert HSL to HEX
  return hslToHex(h, s, l);
};

// Generate a random color based on a seed (name, id, etc.)
export const generateSeededColor = (seed) => {
  let hash = 0;
  
  // Create hash from string
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB values
  const h = Math.abs(hash % 360);
  const s = 50 + Math.abs((hash >> 3) % 30); // 50-80%
  const l = 45 + Math.abs((hash >> 6) % 15); // 45-60%
  
  return hslToHex(h, s, l);
};

// Helper function to convert HSL to HEX
export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Check if a color is light or dark
export const isLightColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if light, false if dark
  return brightness > 128;
};

// Get appropriate text color for a background
export const getTextColorForBackground = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF';
};
