import axios from 'axios';

// No default Content-Type here: axios already sets 'application/json' for
// plain object bodies automatically. Forcing it as an instance-wide default
// breaks multipart/form-data uploads (axios JSON-stringifies FormData bodies
// when it sees an 'application/json' content-type already present).
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Lets AuthContext react immediately when a request comes back unauthorized
// (e.g. an expired token), instead of only catching it on the next reload.
let unauthorizedHandler = null;
export const onUnauthorized = (handler) => {
    unauthorizedHandler = handler;
};

// Centralize "session expired" handling: any 401 clears the stale token so
// the app doesn't keep sending it and can fall back to the logged-out state.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            unauthorizedHandler?.();
        }
        return Promise.reject(error);
    }
);

export default api;
