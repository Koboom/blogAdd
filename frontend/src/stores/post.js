// stores/post.js
import { defineStore } from 'pinia';
import apiClient from '../api'; // apiClient instance'ımızı içeri aktar
// import router from '../router'; // Yönlendirme için router'ı içeri aktarabiliriz, ancak şimdilik gerekli değil

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
    async fetchPostById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/posts/${id}`);
        this.currentPost = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Gönderi detayları getirilirken bir hata oluştu.';
        console.error(`Error fetching post ${id}:`, error);
      } finally {
        this.loading = false;
      }
    },

    // Yeni bir blog yazısı oluştur
    async createPost(postData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/posts', postData);
        // Yeni oluşturulan gönderiyi posts dizisine ekle (isteğe bağlı, ama genellikle iyi bir UX)
        this.posts.push(response.data.post); // Backend'in 'post' anahtarıyla döndürdüğünü varsayıyoruz
        this.currentPost = response.data.post; // Yeni oluşturulan gönderiyi currentPost olarak ayarla
        // Yönlendirme yapmak isterseniz: router.push(`/posts/${response.data.post.slug}`);
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
        const index = this.posts.findIndex(post => post.id === id);
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
        this.posts = this.posts.filter(post => post.id !== id);
        this.currentPost = null; // Silinen gönderi artık currentPost olamaz
        // Yönlendirme yapmak isterseniz: router.push('/');
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