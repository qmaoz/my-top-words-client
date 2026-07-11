import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 30000,
});

instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem('token');
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/sign-up')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
