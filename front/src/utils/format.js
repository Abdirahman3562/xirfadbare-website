export const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img !== "string") return img;
    if (img.startsWith("http") || img.startsWith("data:image")) return img;

    // Remove leading slash if present to avoid double slashes
    const cleanPath = img.startsWith("/") ? img.substring(1) : img;

    return `http://localhost:5000/${cleanPath}`;
};
