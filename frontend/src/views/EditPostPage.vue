<template>
  <div class="edit-post-container">
    <h1>Blog Yazısını Düzenle</h1>
    <form @submit.prevent="handleSubmit" class="post-form">
      <div class="form-group">
        <label for="title">Başlık:</label>
        <input type="text" id="title" v-model="title" required />
      </div>

      <div class="form-group">
        <label for="content">İçerik:</label>
        <textarea id="content" v-model="content" rows="15" required></textarea>
      </div>

      <div v-if="postStore.loading" class="loading-message">Yükleniyor / Kaydediliyor...</div>
      <div v-if="postStore.error" class="error-message">Hata: {{ postStore.error }}</div>

      <div class="form-actions">
        <button type="submit" :disabled="postStore.loading" class="submit-button">
          Değişiklikleri Kaydet
        </button>
        <button type="button" @click="router.back()" class="cancel-button">
          İptal Et
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth'; // Yetkilendirme kontrolü için

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();

const postId = ref(route.params.id); // URL'den gelen yazı ID'si
const title = ref('');
const content = ref('');

// Yazı verilerini yükleme fonksiyonu
const fetchPostData = async () => {
  postStore.clearError();
  await postStore.fetchPostById(postId.value);
  if (postStore.selectedPost) {
    // Yetkilendirme kontrolü: Yazar değilse veya admin değilse Anasayfa'ya yönlendir
    const isAuthor = authStore.user && authStore.user._id === postStore.selectedPost.user?._id;
    if (!isAuthor && !authStore.isAdmin) {
      alert('Bu yazıyı düzenleme yetkiniz yok.');
      router.push('/');
      return;
    }
    title.value = postStore.selectedPost.title;
    content.value = postStore.selectedPost.content;
  } else if (!postStore.loading && postStore.error) {
    // Yazı bulunamadı veya hata oluştu
    alert('Yazı yüklenirken bir hata oluştu veya bulunamadı.');
    router.push('/');
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    alert('Bu sayfayı görüntülemek için giriş yapmalısınız.');
    router.push('/login');
    return;
  }
  fetchPostData();
});

// URL'deki ID değişirse yazıyı tekrar çek (farklı bir yazıyı düzenlemeye geçişte)
watch(() => route.params.id, (newId) => {
  if (newId) {
    postId.value = newId;
    fetchPostData();
  }
});

const handleSubmit = async () => {
  postStore.clearError();
  try {
    const updatedPost = {
      title: title.value,
      content: content.value,
    };
    await postStore.updatePost(postId.value, updatedPost); // Post Store'daki updatePost action'ını çağır
    alert('Yazı başarıyla güncellendi!');
    router.push(`/posts/${postId.value}`); // Güncellendikten sonra detay sayfasına yönlendir
  } catch (error) {
    console.error('Yazı güncellenirken bir sorun oluştu:', error);
    // Hata zaten store tarafından set edildiği için burada özel bir işlem yapmaya gerek yok
  }
};
</script>

<style scoped>
.edit-post-container {
  max-width: 700px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.post-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 200px;
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* Butonları sağa hizala */
  gap: 15px; /* Butonlar arası boşluk */
  margin-top: 20px;
}

.submit-button, .cancel-button {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.submit-button {
  background-color: #007bff;
  color: white;
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.loading-message {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1rem;
  color: #007bff;
}

.error-message {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1rem;
  color: #dc3545;
}
</style>