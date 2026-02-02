const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const VITE_API_URL = import.meta.env.VITE_API_URL;

let BASE_URL = VITE_API_URL || 'https://xirfadbare-backend.onrender.com';

// 🚀 Only auto-switch to local backend if running on localhost and NO VITE_API_URL is provided
if (isLocalhost && !VITE_API_URL) {
    BASE_URL = 'http://localhost:5000';
}

export const API_BASE_URL = `${BASE_URL}/api`;
export const SERVER_URL = BASE_URL;





