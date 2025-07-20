// frontend/src/stores/auth.js

import { defineStore } from 'pinia';
import apiClient from '../api';
import router from '../router'; // router'ı import ettiğinizden emin olun

export const useAuthStore = defineStore('auth', {
  state: () => {
    // ... (state kısmı aynı kalacak, çünkü localStorage okuma mantığı doğru) ...
    let user = null;
    let token = null;

    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error("localStorage'dan kullanıcı ayrıştırılırken hata:", e);
        localStorage.removeItem('user');
      }
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken && storedToken !== "undefined") {
      token = storedToken;
    }

    return {
      user: user,
      token: token,
      loading: false,
      error: null,
    };
  },

  getters: {
    // ... (getters kısmı aynı kalacak, doğru tanımlanmış) ...
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    userNameOrEmail: (state) => {
      if (state.user) {
        return state.user.username ?? state.user.email ?? 'Kullanıcı';
      }
      return '';
    }
  },

  actions: {
    clearError() {
      this.error = null;
    },

     async changePassword(passwords) { // { currentPassword, newPassword } bekler
      this.loading = true;
      this.error = null;
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`, // Token'ı gönderiyoruz
          },
        };
        const response = await apiClient.put('/auth/change-password', passwords, config);
        this.loading = false;
        // Başarı mesajı döndür
        return response.data.message;
      } catch (err) {
        this.loading = false;
        this.error = err.response?.data?.message || 'Şifre değiştirme başarısız oldu.';
        console.error('Şifre değiştirme hatası:', err.response?.data || err);
        throw err; // Bileşene hatayı yay
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/register', userData);
        // Backend'den gelen yanıtın doğrudan kullanıcı bilgilerini içerdiğini varsayıyoruz
        this.user = {
          _id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
        };
        this.token = response.data.token;

        if (this.user) {
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          localStorage.removeItem('user');
        }
        localStorage.setItem('token', this.token);
        router.push('/');
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
        // Backend'den gelen yanıtın doğrudan kullanıcı bilgilerini içerdiğini varsayıyoruz
        this.user = {
          _id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
        };
        this.token = response.data.token;

        if (this.user) {
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          localStorage.removeItem('user');
        }
        localStorage.setItem('token', this.token);
        router.push('/');
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



    // Bu kısım Google Auth kullanılıyorsa önemlidir.
    // Google Auth'dan gelen `user` objesi de doğrudan objenin kendisi olmalı, .user değil.
    setGoogleAuth(token, user) {
        this.token = token;
        this.user = user; // Burası zaten doğruysa dokunmaya gerek yok.
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
        localStorage.setItem('token', token);
    }
  },
});