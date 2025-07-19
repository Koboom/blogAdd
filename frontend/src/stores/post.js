// stores/post.js
import { defineStore } from 'pinia';
import apiClient from '../api'; // apiClient instance'ımızı içeri aktar

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [], // Tüm blog yazılarını tutacak dizi
    currentPost: null, // Tek bir blog yazısının detaylarını tutacak obje
    loading: false, // API istekleri sırasında yüklenme durumunu gösterir
    error: null, // API hatalarını tutar
  }),
  getters: {
    // Tüm gönderileri döndürür
    allPosts: (state) => state.posts,
    // Şu anki gönderiyi döndürür
    postDetail: (state) => state.currentPost,
  },
  actions: {
    // Tüm blog yazılarını getir
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

    // Belirli bir blog yazısını ID'ye göre getir
   // frontend/src/stores/post.js

// Belirli bir blog yazısını ID'ye göre getir
async fetchPostById(id) {
    this.loading = true;
    this.error = null; // Önceki hataları temizle
    this.currentPost = null; // Önceki post'u temizle, yeni veri için hazırla

    console.log(`[Pinia Store] fetchPostById çağrıldı, ID: ${id}`); // DEBUG LOG
    console.log(`[Pinia Store] Başlangıç loading: ${this.loading}, currentPost: ${this.currentPost}`); // DEBUG LOG

    try {
        const response = await apiClient.get(`/posts/${id}`);
        this.currentPost = response.data; // Burası önemli! Backend'den gelen veriyi atıyoruz.
        console.log("[Pinia Store] Veri başarıyla çekildi, response.data:", response.data); // DEBUG LOG
        console.log("[Pinia Store] currentPost güncellendi:", this.currentPost); // DEBUG LOG
    } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi detayları getirilirken bir hata oluştu.';
        this.currentPost = null; // Hata durumunda currentPost'u boş bırak
        console.error(`[Pinia Store] fetchPostById hatası ID ${id}:`, error); // DEBUG LOG
    } finally {
        this.loading = false;
        console.log(`[Pinia Store] fetchPostById tamamlandı. Loading: ${this.loading}, currentPost:`, this.currentPost); // DEBUG LOG
    }
},

    // Yeni bir blog yazısı oluştur
    async createPost(postData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/posts', postData);
        // Backend'den doğrudan post objesi geliyor (populatedPost)
        this.posts.unshift(response.data); // En üste ekle
        this.currentPost = response.data; // Yeni oluşturulan gönderiyi currentPost olarak ayarla
        return response.data; // Bileşene yanıtı döndür
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi oluşturulurken bir hata oluştu.';
        console.error('Error creating post:', error);
        throw error; // Bileşenin hatayı yakalamasına izin ver
      } finally {
        this.loading = false;
      }
    },

    // Mevcut bir blog yazısını güncelle
    async updatePost(id, postData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/posts/${id}`, postData);
        // Güncellenen gönderiyi posts dizisinde bul ve güncelle
        // post.id yerine post._id kullanıldı
        const index = this.posts.findIndex(post => post._id === id); // DÜZELTİLDİ
        if (index !== -1) {
          this.posts[index] = response.data; // Backend'in güncellenmiş objeyi döndürdüğünü varsayıyoruz
        }
        this.currentPost = response.data; // Güncellenen gönderiyi currentPost olarak ayarla
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi güncellenirken bir hata oluştu.';
        console.error(`Error updating post ${id}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Belirli bir blog yazısını sil
    async deletePost(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/posts/${id}`);
        // Silinen gönderiyi posts dizisinden kaldır
        // post.id yerine post._id kullanıldı
        this.posts = this.posts.filter(post => post._id !== id); // DÜZELTİLDİ
        this.currentPost = null; // Silinen gönderi artık currentPost olamaz
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi silinirken bir hata oluştu.';
        console.error(`Error deleting post ${id}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Hata mesajını temizle
    clearError() {
      this.error = null;
    }
  }
});