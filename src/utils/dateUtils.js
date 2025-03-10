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

// Format a year with BCE/CE designation
export const formatYear = (year, includeBceLabel = true, formatStyle = 'default') => {
  if (year === null || year === undefined) return "";

  // Convert to number to ensure proper comparison
  const numYear = parseInt(year);

  if (isNaN(numYear)) return year;

  if (numYear <= 0) {
    // For BCE years, we need to convert from internal representation (0 = 1 BCE, -1 = 2 BCE, etc.)
    const bceYear = Math.abs(numYear) + 1;

    if (!includeBceLabel) {
      return bceYear.toString();
    }

    // Different format styles
    switch (formatStyle) {
      case 'compact':
        return `${bceYear}B`;
      case 'timeline':
        return `${bceYear}`;
      default:
        return `${bceYear} BCE`;
    }
  } else {
    // CE years
    if (!includeBceLabel) {
      return numYear.toString();
    }

    // Different format styles
    switch (formatStyle) {
      case 'compact':
        return `${numYear}`;
      case 'timeline':
        return `${numYear}`;
      default:
        return `${numYear} CE`;
    }
  }
};

// Convert displayed year to internal representation
export const parseYear = (yearStr) => {
  if (!yearStr || yearStr.trim() === '') return null;

  // Handle if it's already a negative number (internal BCE format)
  if (/^-\d+$/.test(yearStr)) {
    return parseInt(yearStr);
  }

  // Remove any commas or spaces
  yearStr = yearStr.replace(/,|\s+/g, '');

  // Check for BCE/BC suffix
  const isBce = /BCE$|BC$|B\.C\.E\.$|B\.C\.$/.test(yearStr.toUpperCase());

  // Remove suffix and convert to number
  const numericPart = yearStr.replace(/BCE$|BC$|CE$|AD$|B\.C\.E\.$|B\.C\.$|C\.E\.$|A\.D\.$|[^\d-]/gi, '');
  let year = parseInt(numericPart);

  if (isNaN(year)) return null;

  // For BCE years, convert to internal representation (1 BCE = 0, 2 BCE = -1, etc.)
  if (isBce) {
    year = -year + 1;
  }

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

// Compare two years, handling BCE dates properly
export const compareYears = (year1, year2) => {
  if (year1 === year2) return 0;
  if (year1 === null || year1 === undefined) return -1;
  if (year2 === null || year2 === undefined) return 1;

  return year1 - year2;
};
