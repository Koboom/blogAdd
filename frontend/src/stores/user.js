// frontend/src/stores/user.js
// Bu dosya, kullanıcılarla ilgili API çağrılarını (kullanıcıları getir, rol güncelle, kullanıcı sil, admin istatistiklerini getir) yönetir.

import { defineStore } from 'pinia';
import apiClient from '../api'; // Axios instance'ımızı içeri aktarıyoruz

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [], // Tüm kullanıcıları tutacak dizi
    loading: false, // Kullanıcı listesi yükleniyor mu durumu
    error: null, // Kullanıcı listesi veya işlemleri için hata mesajı

    adminStats: { // Admin paneli istatistiklerini tutacak obje
      totalUsers: 0,
      totalPosts: 0,
      pendingPosts: 0,
    },
    statsLoading: false, // İstatistikler yükleniyor mu durumu
    statsError: null,    // İstatistikler için hata mesajı
  }),
  actions: {
    // Tüm kullanıcıları backend'den çeker
    async fetchUsers() {
      this.loading = true;
      this.error = null; // Önceki hataları temizle
      try {
        const response = await apiClient.get('/users'); // /api/users rotasına GET isteği
        this.users = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcılar getirilirken bir hata oluştu.';
        console.error('Error fetching users:', error);
        throw error; // Hatayı tekrar fırlat ki bileşenler de yakalayabilsin
      } finally {
        this.loading = false;
      }
    },

    // Belirli bir kullanıcının rolünü günceller
    async updateUserRole(userId, newRole) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/users/${userId}/role`, { role: newRole }); // /api/users/:id/role rotasına PUT isteği
        // Güncellenen kullanıcıyı store'daki users dizisinde bul ve rolünü güncelle
        const index = this.users.findIndex(user => user._id === userId);
        if (index !== -1) {
          this.users[index].role = response.data.role;
        }
        return response.data; // Güncellenen kullanıcı verisini döndür
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.';
        console.error(`Error updating user role ${userId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Belirli bir kullanıcıyı siler
    async deleteUser(userId) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/users/${userId}`); // /api/users/:id rotasına DELETE isteği
        // Silinen kullanıcıyı store'daki users dizisinden çıkar
        this.users = this.users.filter(user => user._id !== userId);
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.';
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Admin paneli için genel istatistikleri çeker
    async fetchAdminStats() {
      this.statsLoading = true;
      this.statsError = null;
      try {
        const response = await apiClient.get('/users/stats'); // /api/users/stats rotasına GET isteği
        this.adminStats = response.data; // Çekilen istatistikleri adminStats state'ine ata
      } catch (error) {
        this.statsError = error.response?.data?.message || 'Admin istatistikleri getirilirken bir hata oluştu.';
        console.error('Error fetching admin stats:', error);
        throw error;
      } finally {
        this.statsLoading = false;
      }
    },

    // Hata mesajlarını temizler
    clearError() {
      this.error = null;
      this.statsError = null;
    }
  },
  getters: {
    // Tüm kullanıcıları döndüren getter
    allUsers: (state) => state.users,
    // Admin istatistiklerini döndüren getter
    getAdminStats: (state) => state.adminStats,
  },
});
