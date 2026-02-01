/**
 * Centralized slugify function to ensure consistent URL generation
 * @param {string} text - The text to slugify (usually course or lesson title)
 * @returns {string} - The slugified text
 */
export const slugify = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")           // Replace spaces with -
        .replace(/[^\w-]+/g, "")         // Remove all non-word chars except -
        .replace(/--+/g, "-")            // Replace multiple - with single -
        .replace(/^-+/, "")              // Trim - from start of text
        .replace(/-+$/, "");             // Trim - from end of text
};
