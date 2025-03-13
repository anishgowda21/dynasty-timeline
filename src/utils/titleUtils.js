/**
 * Utility to manage page titles in the Dynasty Timeline application
 */

/**
 * Sets the page title with an optional suffix
 * @param {string} title - The main page title
 * @param {boolean} includeSuffix - Whether to include the app name suffix (default: true)
 */
export const setPageTitle = (title, includeSuffix = true) => {
  if (includeSuffix) {
    document.title = `${title} | Dynasty Timeline`;
  } else {
    document.title = title;
  }
};

/**
 * Returns a formatted title for a specific entity 
 * @param {string} entityType - Type of entity (e.g., "King", "Dynasty")
 * @param {string} entityName - Name of the entity
 * @returns {string} Formatted title string
 */
export const formatEntityTitle = (entityType, entityName) => {
  return `${entityType}: ${entityName}`;
};
