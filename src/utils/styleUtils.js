/**
 * Style utility functions to maintain consistent styling
 * across components for event and war types, importance levels, etc.
 */

/**
 * Get CSS class for event type styling
 * @param {string} type - The event type
 * @returns {string} CSS class string
 */
export const getEventTypeClass = (type) => {
  switch (type) {
    case "Religious":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Political":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Cultural":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Economic":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Scientific":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "Diplomatic":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    case "Military":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

/**
 * Get CSS class for war type styling
 * @param {string} type - The war type
 * @returns {string} CSS class string
 */
export const getWarTypeClass = (type) => {
  switch (type) {
    case "Conquest":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Civil War":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Succession":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Religious":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Trade":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Naval":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "Colonial":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Territorial":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

/**
 * Get CSS class for importance level styling
 * @param {string} importance - The importance level (high, medium, low)
 * @returns {string} CSS class string 
 */
export const getImportanceClass = (importance) => {
  switch (importance) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

/**
 * Get CSS class for participant role in wars
 * @param {string} role - The participant's role
 * @returns {string} CSS class string
 */
export const getParticipantRoleClass = (role) => {
  switch (role) {
    case "victor":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "defeated":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "participant":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "ally":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "neutral":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};
