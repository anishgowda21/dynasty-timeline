// Format a date string (YYYY-MM-DD) to a readable format
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  
  // Handle year-only dates
  if (dateStr.length === 4) return dateStr;
  
  try {
    const date = new Date(dateStr);
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

// Calculate the time span in years
export const getTimeSpan = (startYear, endYear) => {
  if (!startYear || !endYear) return "";
  return `${startYear} - ${endYear} (${endYear - startYear} years)`;
};

// Calculate the percentage position for timeline visualization
export const calculateTimelinePosition = (year, minYear, maxYear) => {
  if (!year || !minYear || !maxYear) return 0;
  
  const totalSpan = maxYear - minYear;
  if (totalSpan <= 0) return 0;
  
  const position = ((year - minYear) / totalSpan) * 100;
  return Math.max(0, Math.min(100, position));
};

// Get min and max years from a collection of dynasty or king objects
export const getYearRange = (items) => {
  if (!items || items.length === 0) return { minYear: 0, maxYear: 0 };
  
  const minYear = Math.min(...items.map(item => item.startYear));
  const maxYear = Math.max(...items.map(item => item.endYear));
  
  return { minYear, maxYear };
};

// Generate a color based on text (for use when no color is specified)
export const stringToColor = (str) => {
  if (!str) return "#CCCCCC";
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

// Determine if a year is within a time range
export const isYearInRange = (year, startYear, endYear) => {
  return year >= startYear && year <= endYear;
};
