<template>
  <div class="home-container">
    <h1>Blog Yazıları</h1>
    <p>Uygulamamızdaki en son blog yazılarını keşfedin!</p>

    <div v-if="authStore.isAuthenticated" class="create-post-section">
      <router-link to="/create" class="create-post-button">Yeni Yazı Oluştur</router-link>
    </div>

    <div v-if="postStore.loading" class="loading-message">
      Yazılar yükleniyor...
    </div>

    <div v-if="postStore.error" class="error-message">
      Hata: {{ postStore.error }}
    </div>

    <div v-if="!postStore.loading && !postStore.error && postStore.allPosts.length > 0" class="post-list">
      <div v-for="post in postStore.allPosts" :key="post.id" class="post-card">
        <h2>{{ post.title }}</h2>
        <p class="post-author">Yazar: {{ post.author?.username || 'Bilinmiyor' }}</p>
        <p>{{ post.content.substring(0, 150) }}...</p>
        <router-link :to="`/posts/${post.id}`" class="read-more-button">Devamını Oku</router-link>
        <div v-if="authStore.isAuthenticated && authStore.currentUser?.id === post.author_id" class="post-actions">
          <router-link :to="`/edit-post/${post.id}`" class="edit-button">Düzenle</router-link>
          <button @click="confirmDelete(post.id, post.title)" class="delete-button">Sil</button>
        </div>
      </div>
    </div>

    <div v-if="!postStore.loading && !postStore.error && postStore.allPosts.length === 0" class="no-posts-message">
      Henüz hiç blog yazısı bulunmuyor. İlk yazıyı siz ekleyin!
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePostStore } from '../stores/post'; // Post store'u içeri aktarıyoruz
import { useAuthStore } from '../stores/auth'; // Auth store'u da kullanacağız (kimlik kontrolü için)
import { useRouter } from 'vue-router'; // Yönlendirme için router'ı import ediyoruz

const postStore = usePostStore();
const authStore = useAuthStore();
const router = useRouter(); // useRouter hook'unu kullanıyoruz

// Bileşen yüklendiğinde blog yazılarını çek
onMounted(() => {
  postStore.fetchPosts();
});

const confirmDelete = async (postId, postTitle) => {
  if (confirm(`"${postTitle}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) {
    try {
      await postStore.deletePost(postId);
      alert('Yazı başarıyla silindi!');
      // Silme sonrası listeyi otomatik güncelleyecektir (store içindeki filter sayesinde)
    } catch (error) {
      alert(`Yazı silinirken hata oluştu: ${postStore.error}`);
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

p {
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

.post-list {
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

.post-card h2 {
  font-size: 1.8rem;
  color: #007bff;
  margin-bottom: 10px;
  word-break: break-word; /* Uzun başlıklar için */
}

.post-author {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 15px;
  font-style: italic;
}

.post-card p {
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 20px;
  text-align: left; /* Paragrafın metin hizalamasını düzelt */
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
  align-self: flex-start; /* Butonu sola hizala */
}

.read-more-button:hover {
  background-color: #0056b3;
}

.post-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end; /* Butonları sağa hizala */
}

.edit-button, .delete-button {
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  text-decoration: none; /* Router-link gibi davranması için */
  display: inline-block; /* Router-link gibi davranması için */
  text-align: center; /* Router-link gibi davranması için */
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