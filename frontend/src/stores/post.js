// frontend/src/stores/post.js
import { defineStore } from 'pinia';
import apiClient from '../api';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [],
    currentPost: null, // Bu doğru state adı
    unpublishedPosts: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchPosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/posts');
        this.posts = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderiler getirilirken bir hata oluştu.';
        console.error('Error fetching posts:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPostById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/posts/${id}`);
        console.log('fetchPostById - Backend yanıtı (response.data):', response.data); // YENİ DEBUG LOG
        this.currentPost = response.data; // Backend'den gelen veriyi currentPost'a atıyoruz
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi bulunamadı.';
        console.error(`Error fetching post ${id}:`, error);
        this.currentPost = null;
      } finally {
        this.loading = false;
      }
    },

    async createPost(postData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/posts', postData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi oluşturulurken bir hata oluştu.';
        console.error('Error creating post:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePost(id, postData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/posts/${id}`, postData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.currentPost = response.data;
        const index = this.posts.findIndex(post => post._id === id);
        if (index !== -1) {
          this.posts[index] = { ...this.posts[index], ...response.data };
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi güncellenirken bir hata oluştu.';
        console.error(`Error updating post ${id}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePost(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/posts/${id}`);
        this.posts = this.posts.filter(post => post._id !== id);
        this.unpublishedPosts = this.unpublishedPosts.filter(post => post._id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi silinirken bir hata oluştu.';
        console.error(`Error deleting post ${id}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUnpublishedPosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/posts/unpublished');
        this.unpublishedPosts = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Yayınlanmamış gönderiler getirilirken bir hata oluştu.';
        console.error('Error fetching unpublished posts:', error);
      } finally {
        this.loading = false;
      }
    },

    async updatePostPublicationStatus(postId, isPublished) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/posts/${postId}/publish`, { isPublished });
        this.unpublishedPosts = this.unpublishedPosts.filter(post => post._id !== postId);
        const index = this.posts.findIndex(post => post._id === postId);
        if (index !== -1) {
          this.posts[index] = { ...this.posts[index], ...response.data };
        } else if (isPublished) {
          this.posts.unshift(response.data);
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi yayın durumu güncellenirken bir hata oluştu.';
        console.error(`Error updating post publication status ${postId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  },
  getters: {
    allPosts: (state) => state.posts,
    getUnpublishedPosts: (state) => state.unpublishedPosts,
    postDetail: (state) => state.currentPost,
  },
});
