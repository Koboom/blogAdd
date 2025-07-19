<template>
  <div class="post-detail-container">
    <div v-if="postStore.loading" class="loading-message">Yazı yükleniyor...</div>
    <div v-else-if="postStore.error" class="error-message">Hata: {{ postStore.error }}</div>
    <div v-else-if="currentPost" class="post-content-wrapper">
      <h1 class="post-title">{{ currentPost.title }}</h1>
      <p class="post-meta">
        Yazar: <span class="meta-author">{{ currentPost.user?.username || 'Bilinmiyor' }}</span> |
        Tarih: <span class="meta-date">{{ formatDate(currentPost.createdAt) }}</span>
      </p>
      <div class="post-body" v-html="formattedContent"></div>

      <div v-if="canManagePost" class="post-actions">
        <button @click="goToEditPost" class="edit-button">Yazıyı Düzenle</button>
        <button @click="confirmDeletePost" class="delete-button">Yazıyı Sil</button>
      </div>

      <router-link to="/" class="back-button">← Tüm Yazılara Geri Dön</router-link>
    </div>
    <div v-else class="not-found-message">
      Yazı bulunamadı veya bir sorun oluştu.
      <router-link to="/" class="back-button">Anasayfaya Dön</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth'; // Auth store'u import et

const route = useRoute(); // Geçerli rotayı almak için
const router = useRouter(); // Yönlendirme için
const postStore = usePostStore();
const authStore = useAuthStore(); // Auth store'u kullan

// currentPost Pinia store'da `selectedPost` olarak saklanıyor
const currentPost = computed(() => postStore.selectedPost);

// Kullanıcının yazıyı yönetme yetkisi olup olmadığını kontrol et
const canManagePost = computed(() => {
  if (!authStore.isAuthenticated || !currentPost.value) return false;
  // Yazının yazarı veya yönetici (admin) ise
  return authStore.user._id === currentPost.value.user?._id || authStore.isAdmin;
});

// onMounted içinde post'u ID'ye göre çek
onMounted(() => {
  const postId = route.params.id;
  postStore.fetchPostById(postId);
});

// Route parametresi değiştiğinde (örneğin aynı sayfadan başka bir yazıya geçişte)
// yazıyı yeniden çekmek için watcher
watch(() => route.params.id, (newId) => {
  if (newId) {
    postStore.fetchPostById(newId);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// İçeriği HTML olarak güvenli bir şekilde görüntülemek için (Markdown renderlama yapılmıyorsa)
const formattedContent = computed(() => {
  // Eğer post içeriği basit metin ise, <pre> veya <p> etiketleri arasına alabilirsiniz.
  // Markdown'dan HTML'e çeviri yapacaksanız, burada bir kütüphane kullanmanız gerekir (örn: marked.js).
  // Şimdilik sadece yeni satırları <br> ile değiştirerek basit formatlama yapalım.
  return currentPost.value?.content ? currentPost.value.content.replace(/\n/g, '<br>') : '';
});

const goToEditPost = () => {
  router.push(`/posts/${currentPost.value._id}/edit`);
};

const confirmDeletePost = async () => {
  if (confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
    try {
      await postStore.deletePost(currentPost.value._id);
      alert('Yazı başarıyla silindi!');
      router.push('/'); // Yazı silindikten sonra Anasayfa'ya yönlendir
    } catch (error) {
      alert('Yazı silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  }
};
</script>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  line-height: 1.7;
  color: #333;
}

.loading-message, .error-message, .not-found-message {
  padding: 30px;
  text-align: center;
  font-size: 1.3rem;
  color: #555;
  background-color: #e0f2f7;
  border: 1px solid #b3e0ed;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #ffe0e6;
  border-color: #ffb3c1;
  color: #dc3545;
}

.post-content-wrapper {
  padding-bottom: 30px;
}

.post-title {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  line-height: 1.2;
}

.post-meta {
  text-align: center;
  font-size: 1rem;
  color: #777;
  margin-bottom: 30px;
}

.meta-author {
  font-weight: bold;
  color: #007bff;
}

.meta-date {
  color: #555;
}

.post-body {
  font-size: 1.15rem;
  line-height: 1.8;
  white-space: pre-wrap; /* Boşlukları ve yeni satırları korur */
  margin-bottom: 40px;
  text-align: justify;
}

.post-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 40px; /* Alttaki butondan boşluk */
}

.edit-button, .delete-button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.edit-button {
  background-color: #ffc107;
  color: #333;
}

.edit-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.back-button {
  display: block;
  width: fit-content;
  margin: 0 auto;
  background-color: #6c757d;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.05rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}
</style>