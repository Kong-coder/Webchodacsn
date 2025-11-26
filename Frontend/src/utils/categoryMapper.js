/**
 * Category Mapping Utility
 * Centralized category definitions for consistency across the app
 */

// Category mapping: English key -> Vietnamese display name
export const CATEGORIES = {
  massage: "Massage",
  skincare: "Chăm Sóc Da",
  therapy: "Trị Liệu",
  hair: "Chăm Sóc Tóc",
};

// Category icons (optional)
export const CATEGORY_ICONS = {
  massage: "💆",
  skincare: "✨",
  therapy: "🌿",
  hair: "💇",
};

/**
 * Get Vietnamese name for a category
 * @param {string} categoryKey - English category key (e.g., "massage")
 * @returns {string} Vietnamese category name (e.g., "Massage")
 */
export const getCategoryName = (categoryKey) => {
  return CATEGORIES[categoryKey] || categoryKey;
};

/**
 * Get category icon
 * @param {string} categoryKey - English category key
 * @returns {string} Category icon emoji
 */
export const getCategoryIcon = (categoryKey) => {
  return CATEGORY_ICONS[categoryKey] || "✨";
};

/**
 * Get all categories as array of objects
 * @returns {Array} Array of {key, name, icon}
 */
export const getAllCategories = () => {
  return Object.entries(CATEGORIES).map(([key, name]) => ({
    key,
    name,
    icon: CATEGORY_ICONS[key] || "✨",
  }));
};

/**
 * Get category key from Vietnamese name
 * @param {string} vietnameseName - Vietnamese category name
 * @returns {string} English category key
 */
export const getCategoryKey = (vietnameseName) => {
  const entry = Object.entries(CATEGORIES).find(([key, name]) => name === vietnameseName);
  return entry ? entry[0] : vietnameseName;
};
