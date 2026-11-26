// Central API base URL — reads from Vite env variable in production, falls back to localhost in dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.warn('VITE_API_URL is not set; API calls will fall back to http://localhost:5000 and fail in production. Set VITE_API_URL to the deployed backend URL.');
}

export default API_BASE;
