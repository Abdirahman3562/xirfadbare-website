export const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img !== "string") return img;
    if (img.startsWith("http") || img.startsWith("data:image")) return img;

    // Remove leading slash if present to avoid double slashes
    const cleanPath = img.startsWith("/") ? img.substring(1) : img;

    return `http://localhost:5000/${cleanPath}`;
};

export const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
};
