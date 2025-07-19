<template>
  <div class="home-container">
    <h1 class="page-title">Blog Yazıları</h1>
    <p class="tagline">Uygulamamızdaki en son blog yazılarını keşfedin!</p>

    <div v-if="authStore.isAuthenticated" class="create-post-section">
      <router-link to="/create" class="create-post-button">Yeni Yazı Oluştur</router-link>
    </div>

    <div v-if="postStore.loading" class="loading-message">
      Yazılar yükleniyor...
    </div>

    <div v-else-if="postStore.error" class="error-message">
      Hata: {{ postStore.error }}
    </div>

    <div v-else-if="postStore.posts.length > 0" class="post-grid">
      <div v-for="post in postStore.posts" :key="post._id" class="post-card">
        <h2 class="post-card-title">{{ post.title }}</h2>
        <p class="post-card-meta">Yazar: {{ post.author?.username || 'Bilinmiyor' }} | {{ formatDate(post.createdAt) }}</p>
        <p class="post-card-content">{{ truncateContent(post.content, 150) }}</p>

        <router-link :to="`/posts/${post._id}`" class="read-more-button">Devamını Oku</router-link>

        <div v-if="canModifyPost(post)" class="post-actions">
          <router-link :to="`/posts/${post._id}/edit`" class="edit-button">Düzenle</router-link>
          <button @click="confirmDelete(post._id, post.title)" class="delete-button">Sil</button>
        </div>
      </div>
    </div>

    <div v-else class="no-posts-message">
      Henüz hiç blog yazısı bulunmuyor. İlk yazıyı siz ekleyin!
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const postStore = usePostStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  postStore.fetchPosts();
});

const truncateContent = (content, maxLength) => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// Yazıyı düzenleme veya silme yetkisi olanları kontrol eden yeni fonksiyon
const canModifyPost = (post) => {
  if (!authStore.isAuthenticated || !authStore.user || !post || !post.author) {
    return false;
  }
  // Kendi yazısı mı veya admin mi?
  return authStore.user._id === post.author._id || authStore.isAdmin;
};

const confirmDelete = async (postId, postTitle) => {
  if (confirm(`"${postTitle}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) {
    try {
      await postStore.deletePost(postId);
      alert('Yazı başarıyla silindi!');
      // Silme sonrası postStore.posts otomatik olarak güncelleneceği için,
      // sayfayı tekrar yüklemeye gerek kalmaz.
    } catch (error) {
      alert(`Yazı silinirken hata oluştu: ${error.message || 'Bilinmeyen Hata'}`);
      console.error('Silme hatası:', error);
    }
  }
};
</script>

<style scoped>
/* Mevcut stil kodlarınız */
.home-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.tagline {
  font-size: 1.1rem;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

.loading-message, .no-posts-message, .error-message {
  text-align: center;
  margin-top: 30px;
  font-size: 1.2rem;
  color: #888;
}

.error-message {
  color: #dc3545;
}

.create-post-section {
  text-align: center;
  margin-bottom: 30px;
}

.create-post-button {
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.create-post-button:hover {
  background-color: #218838;
}

.post-grid { /* post-list yerine post-grid kullanıldı */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.post-card {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease-in-out;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-card-title { /* h2 için class eklendi */
  font-size: 1.8rem;
  color: #007bff;
  margin-bottom: 10px;
  word-break: break-word;
}

.post-card-meta { /* post-author yerine post-card-meta kullanıldı */
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 15px;
  font-style: italic;
}

.post-card-content { /* p için class eklendi */
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 20px;
  text-align: left;
  flex-grow: 1; /* İçeriğin kartı doldurmasını sağlar */
}

.read-more-button {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  align-self: flex-start;
}

.read-more-button:hover {
  background-color: #0056b3;
}

.post-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-button, .delete-button {
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.edit-button {
  background-color: #ffc107;
  color: #333;
  border: none;
}

.edit-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
}

.delete-button:hover {
  background-color: #c82333;
}
</style>