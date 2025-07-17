import { defineStore } from 'pinia';
import apiClient from '../api'; // Axios instance'ımızı içeri aktar
import router from '../router'; // Yönlendirme için router'ı içeri aktar

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null, // Kullanıcı bilgilerini localStorage'dan al
    token: localStorage.getItem('token') || null, // Token'ı localStorage'dan al
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token, // Token varsa oturum açık demektir
    currentUser: (state) => state.user,
  },
  actions: {
    // Kullanıcı girişi
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user; // Backend'in kullanıcı bilgilerini de döndürdüğünü varsayıyoruz
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        router.push('/'); // Başarılı girişte ana sayfaya yönlendir
      } catch (error) {
        this.error = error.response?.data?.message || 'Giriş başarısız oldu.';
        throw error; // Component'te yakalamak için hatayı tekrar fırlat
      } finally {
        this.loading = false;
      }
    },

    // Kullanıcı kaydı
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/register', userData);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        router.push('/'); // Başarılı kayıtta ana sayfaya yönlendir
      } catch (error) {
        this.error = error.response?.data?.message || 'Kayıt başarısız oldu.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Kullanıcı çıkışı
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login'); // Çıkışta giriş sayfasına yönlendir
    },

    // Google OAuth ile giriş sonrası token'ı ve kullanıcıyı set et
    setAuthFromGoogle(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // Sayfa yenilendiğinde token'ın hala geçerli olup olmadığını kontrol et
    // Basitçe token'ın varlığına bakıyoruz, gerçek bir validasyon için backend'e istek gerekebilir.
    checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      } else {
        this.logout(); // Token veya kullanıcı yoksa çıkış yap
      }
    }
  }
});