// frontend/src/stores/auth.js
import { defineStore } from 'pinia';
import apiClient from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null;
    let token = null;

    // localStorage'dan kullanıcı verisini güvenli bir şekilde ayrıştırma
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error("localStorage'dan kullanıcı ayrıştırılırken hata:", e);
        localStorage.removeItem('user'); // Bozuk veriyi temizle
      }
    }

    // localStorage'dan token'ı güvenli bir şekilde alma
    const storedToken = localStorage.getItem('token');
    if (storedToken && storedToken !== "undefined") {
      token = storedToken;
    }

    return {
      user: user, // Bu user objesi backend'den gelen user objesini tutacak
      token: token,
      loading: false,
      error: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    // Kullanıcı adı veya e-posta için yeni bir getter ekleyebiliriz
    // Bu getter, user objesi içinde username varsa onu, yoksa email'i döner.
    userNameOrEmail: (state) => {
      if (state.user) {
        return state.user.username || state.user.email || 'Kullanıcı';
      }
      return '';
    }
  },

  actions: {
    clearError() {
      this.error = null;
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/register', userData);
        this.user = response.data.user; // Backend'den gelen user objesi burada set ediliyor
        this.token = response.data.token;
        localStorage.setItem('user', JSON.stringify(this.user)); // user objesini string'e çevirip kaydet
        localStorage.setItem('token', this.token);
      } catch (err) {
        this.error = err.response?.data?.message || 'Kayıt başarısız oldu.';
        console.error('Kayıt hatası:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/login', credentials);
        this.user = response.data.user; // Backend'den gelen user objesi burada set ediliyor
        this.token = response.data.token;
        localStorage.setItem('user', JSON.stringify(this.user)); // user objesini string'e çevirip kaydet
        localStorage.setItem('token', this.token);
      } catch (err) {
        this.error = err.response?.data?.message || 'Giriş başarısız oldu.';
        console.error('Giriş hatası:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    setGoogleAuth(token, user) { // Google Auth için kullanıcı ve token'ı set et
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }
  },
});