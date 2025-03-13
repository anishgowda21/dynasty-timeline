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

// Cache for formatted years to avoid redundant calculations
const yearFormatCache = new Map();

// Format a year with BCE/CE designation
export const formatYear = (year, includeBceLabel = true, formatStyle = 'default') => {
  if (year === null || year === undefined) return "";

  // Convert to number to ensure proper comparison
  const numYear = parseInt(year);
  if (isNaN(numYear)) return year;

  // Create a cache key
  const cacheKey = `${numYear}-${includeBceLabel}-${formatStyle}`;
  
  // Check if we have a cached result
  if (yearFormatCache.has(cacheKey)) {
    return yearFormatCache.get(cacheKey);
  }

  let result;
  if (numYear <= 0) {
    // For BCE years, we need to convert from internal representation (0 = 1 BCE, -1 = 2 BCE, etc.)
    const bceYear = Math.abs(numYear) + 1;

    if (!includeBceLabel) {
      result = bceYear.toString();
    } else if (formatStyle === 'compact') {
      result = `${bceYear} BCE`;  // Always show full BCE for compact
    } else if (formatStyle === 'timeline') {
      result = `${bceYear} BCE`;  // Always show full BCE for timeline
    } else {
      result = `${bceYear} BCE`;
    }
  } else {
    // CE years
    if (!includeBceLabel) {
      result = numYear.toString();
    } else if (formatStyle === 'compact') {
      result = numYear < 1000 ? `${numYear} CE` : `${numYear}`;  // Show CE only for years < 1000
    } else if (formatStyle === 'timeline') {
      result = `${numYear} CE`;
    } else {
      result = `${numYear} CE`;
    }
  }

  // Cache the result
  yearFormatCache.set(cacheKey, result);
  return result;
};

// Cache for parsed years
const yearParseCache = new Map();

// Convert displayed year to internal representation
export const parseYear = (yearStr) => {
  if (!yearStr || yearStr.trim() === '') return null;
  
  // Check cache first
  if (yearParseCache.has(yearStr)) {
    return yearParseCache.get(yearStr);
  }

  // Handle if it's already a negative number (internal BCE format)
  if (/^-\d+$/.test(yearStr)) {
    const result = parseInt(yearStr);
    yearParseCache.set(yearStr, result);
    return result;
  }

  // Remove any commas or spaces
  const cleanYearStr = yearStr.replace(/,|\s+/g, '');

  // Simplified BCE detection - check for B at the end or BCE/BC
  const isBce = /B(?:CE|C)?$/i.test(cleanYearStr);

  // Remove suffix and convert to number
  const numericPart = cleanYearStr.replace(/[^\d-]/gi, '');
  let year = parseInt(numericPart);

  if (isNaN(year)) return null;

  // For BCE years, convert to internal representation (1 BCE = 0, 2 BCE = -1, etc.)
  if (isBce) {
    year = -year + 1;
  }

  // Cache the result
  yearParseCache.set(yearStr, year);
  return year;
};

// Calculate the time span in years
export const getTimeSpan = (startYear, endYear) => {
  if (!startYear || !endYear) return "";
  const span = Math.abs(endYear - startYear);
  return `${formatYear(startYear)} - ${formatYear(endYear)} (${span} years)`;
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

  let minYear = Infinity;
  let maxYear = -Infinity;
  
  for (const item of items) {
    if (item.startYear < minYear) minYear = item.startYear;
    if (item.endYear > maxYear) maxYear = item.endYear;
  }

  return { minYear, maxYear };
};

// Determine if a year is within a time range
export const isYearInRange = (year, startYear, endYear) => {
  return year >= startYear && year <= endYear;
};

// Compare two years, handling BCE dates properly
export const compareYears = (year1, year2) => {
  if (year1 === year2) return 0;
  if (year1 === null || year1 === undefined) return -1;
  if (year2 === null || year2 === undefined) return 1;

  return year1 - year2;
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
