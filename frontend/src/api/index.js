// frontend/src/api.js
import axios from 'axios';
// DÜZELTME: 'src/api' içinden 'src/stores' klasörüne ulaşmak için '../stores/auth' kullanın
import { useAuthStore } from '../stores/auth';
// DÜZELTME: 'src/api' içinden 'src/router' klasörüne ulaşmak için '../router' kullanın
import router from '../router';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Yetkisiz erişim veya oturum süresi doldu:', error.response.data.message);

      const authStore = useAuthStore();
      authStore.logout();

      router.push('/login');
      alert('Oturumunuzun süresi doldu veya yetkisiz erişim. Lütfen tekrar giriş yapın.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
