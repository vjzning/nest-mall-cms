import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api/admin' : '/api',
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Ignore 401 for login requests to allow form error handling
        if (
            error.response?.status === 401 &&
            !error.config.url.includes('/auth/login')
        ) {
            localStorage.removeItem('token');
            const loginPath = import.meta.env.PROD ? '/admin/login' : '/login';
            if (window.location.pathname !== loginPath) {
                window.location.href = loginPath;
            }
        }
        return Promise.reject(error);
    }
);
