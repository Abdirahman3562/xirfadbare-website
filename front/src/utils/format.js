import { SERVER_URL } from '../config';

export const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img !== "string") return img;
    if (img.startsWith("http") || img.startsWith("data:image") || img.startsWith("blob:")) return img;

    // Remove leading slash from path and trailing slash from SERVER_URL
    const cleanPath = img.startsWith("/") ? img.substring(1) : img;
    const cleanBase = SERVER_URL.endsWith("/") ? SERVER_URL.slice(0, -1) : SERVER_URL;

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
