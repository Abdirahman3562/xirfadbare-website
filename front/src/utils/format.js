import { SERVER_URL } from '../config';

export const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img !== "string") return img;

    // If it's already a full URL or special data/blob URL, return as is
    if (img.startsWith("http") || img.startsWith("data:image") || img.startsWith("blob:")) {
        return img;
    }

    // Ensure SERVER_URL doesn't have a trailing slash
    const cleanBase = SERVER_URL.endsWith("/") ? SERVER_URL.slice(0, -1) : SERVER_URL;

    // Ensure path starts with a single slash for consistency, then remove it for joining
    const cleanPath = img.startsWith("/") ? img.substring(1) : img;

    // Construct final URL
    return `${cleanBase}/${cleanPath}`;
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
