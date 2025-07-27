// frontend/src/stores/user.js
import { defineStore } from 'pinia';
import apiClient from '../api';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    adminStats: {
      totalUsers: 0,
      totalPosts: 0,
      unpublishedPosts: 0, // isApproved yerine isPublished kullanıldığı için adı değişti
    },
    statsLoading: false,
    statsError: null,
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/users');
        this.users = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcılar getirilirken bir hata oluştu.';
        console.error('Error fetching users:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUserRole(userId, newRole) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/users/${userId}/role`, { role: newRole });
        const index = this.users.findIndex(user => user._id === userId);
        if (index !== -1) {
          this.users[index].role = response.data.role;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcı rolü güncellenirken bir hata oluştu.';
        console.error(`Error updating user role ${userId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/users/${userId}`);
        this.users = this.users.filter(user => user._id !== userId);
      } catch (error) {
        this.error = error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.';
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Admin istatistiklerini çek
    async fetchAdminStats() {
      this.statsLoading = true;
      this.statsError = null;
      try {
        // Backend'deki /users/stats rotası artık unpublishedPosts dönecek
        const response = await apiClient.get('/users/stats');
        this.adminStats = response.data;
      } catch (error) {
        this.statsError = error.response?.data?.message || 'Admin istatistikleri getirilirken bir hata oluştu.';
        console.error('Error fetching admin stats:', error);
        throw error;
      } finally {
        this.statsLoading = false;
      }
    },

    clearError() {
      this.error = null;
      this.statsError = null;
    }
  },
  getters: {
    allUsers: (state) => state.users,
    getAdminStats: (state) => state.adminStats,
  },
});
