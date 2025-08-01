<template>
  <div class="post-detail-container">
    <div v-if="postStore.loading" class="loading-message">Yazı yükleniyor...</div>
    <div v-else-if="postStore.error" class="error-message">Hata: {{ postStore.error }}</div>

    <div v-else-if="postStore.currentPost" class="post-card">
      <h1 class="post-title">{{ postStore.currentPost.title }}</h1>
      <p class="post-meta">
        Yazar: {{ postStore.currentPost.author?.username || 'Bilinmiyor' }} |
        Tarih: {{ formatDate(postStore.currentPost.createdAt) }}
      </p>

      <img
        v-if="postStore.currentPost.image"
        :src="getImageUrl(postStore.currentPost.image)"
        :alt="postStore.currentPost.title"
        class="blog-post-image"
      />

      <div class="post-content-full" v-html="postStore.currentPost.content"></div> <!-- DÜZELTİLDİ: v-html kullanıldı -->

      <div v-if="canModifyPost" class="post-actions">
        <router-link :to="`/posts/${postStore.currentPost._id}/edit`" class="edit-button">
          Düzenle
        </router-link>
        <button @click="confirmDelete(postStore.currentPost._id, postStore.currentPost.title)" class="delete-button">Sil</button>
      </div>
    </div>
    <div v-else class="no-post-message">
      Yazı bulunamadı.
    </div>

    <router-link to="/" class="back-button">Ana Sayfaya Dön</router-link>
  </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();

// Resim URL'sini oluşturan fonksiyon
const getImageUrl = (imagePath) => {
  return `http://localhost:5000${imagePath}`;
};

// Watch kullanarak route.params.id değiştiğinde post'u tekrar yükle
watch(() => route.params.id, (newId) => {
  if (newId) {
    postStore.fetchPostById(newId);
  }
}, { immediate: true });

// Kullanıcının yazıyı düzenleme/silme yetkisi olup olmadığını kontrol et
const canModifyPost = computed(() => {
  if (!authStore.isAuthenticated || !postStore.currentPost || !authStore.user) {
    return false;
  }
  // Yazının sahibi mi veya admin mi?
  return (
    authStore.user._id === postStore.currentPost.author._id || authStore.isAdmin
  );
});

// confirmDelete fonksiyonu aynı kalabilir
const confirmDelete = async (postId, postTitle) => {
  if (confirm(`"${postTitle}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) {
    try {
      await postStore.deletePost(postId);
      alert('Yazı başarıyla silindi!');
      router.push('/');
    } catch (err) {
      alert(`Yazı silinirken bir hata oluştu: ${err.message || 'Bilinmeyen Hata'}`);
      console.error('Silme hatası:', err);
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};
</script>

<style scoped>
/* Stiller aynı kalacak */
.post-detail-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.post-card {
  margin-bottom: 30px;
  padding-bottom: 25px;
}

.post-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  word-wrap: break-word;
}

.post-meta {
  font-size: 0.95rem;
  color: #777;
  margin-bottom: 25px;
}

.post-content-full {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  margin-bottom: 30px;
}

.post-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.edit-button, .delete-button {
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
}

.delete-button:hover {
  background-color: #c82333;
}

.back-button {
  display: inline-block;
  margin-top: 30px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #5a6268;
}

.loading-message, .error-message, .no-post-message {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
  font-size: 1.1rem;
  border-radius: 8px;
}

.loading-message {
  background-color: #e6f7ff;
  color: #0056b3;
  border: 1px solid #91d5ff;
}

.error-message {
  background-color: #fff0f6;
  color: #eb2f96;
  border: 1px solid #ffadd2;
}

.no-post-message {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.blog-post-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
