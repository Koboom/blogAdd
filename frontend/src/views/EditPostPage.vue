<template>
  <div class="edit-post-container">
    <h1 class="page-title">{{ isNewPost ? 'Yeni Yazı Oluştur' : 'Yazıyı Düzenle' }}</h1>

    <div v-if="postStore.loading" class="loading-message">Yükleniyor...</div>
    <div v-if="postStore.error" class="error-message">Hata: {{ postStore.error }}</div>
    <div v-if="!authStore.isAuthenticated" class="error-message">
      Bu sayfaya erişim için giriş yapmanız gerekmektedir.
    </div>
    <div v-if="!isAuthorOrAdmin && !isNewPost" class="error-message">
      Bu yazıyı düzenlemeye yetkiniz bulunmamaktadır.
    </div>

    <form @submit.prevent="handleSubmit" class="post-form" v-if="authStore.isAuthenticated && (isAuthorOrAdmin || isNewPost)">
      <div class="form-group">
        <label for="title">Başlık:</label>
        <input type="text" id="title" v-model="postTitle" required placeholder="Yazınızın başlığı">
      </div>
      <div class="form-group">
        <label for="content">İçerik:</label>
        <textarea id="content" v-model="postContent" required rows="10" placeholder="Yazınızın içeriği"></textarea>
      </div>
      <button type="submit" :disabled="postStore.loading" class="submit-button">
        {{ postStore.loading ? 'Kaydediliyor...' : (isNewPost ? 'Yazıyı Oluştur' : 'Kaydet') }}
      </button>
      <router-link :to="isNewPost ? '/' : `/posts/${postId}`" class="cancel-button">İptal</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();

const postId = route.params.id; // Düzenlenecekse yazı ID'si, yoksa undefined
const isNewPost = !postId; // postId yoksa yeni yazı oluşturuluyor demektir

const postTitle = ref('');
const postContent = ref('');

const isAuthorOrAdmin = computed(() => {
  if (!authStore.isAuthenticated || !postStore.selectedPost) {
    return false;
  }
  return (
    authStore.user?._id === postStore.selectedPost.user?._id || authStore.isAdmin
  );
});

onMounted(async () => {
  // Eğer düzenleme modundaysak, mevcut yazıyı çek
  if (!isNewPost) {
    await postStore.fetchPostById(postId);
    if (postStore.selectedPost) {
      // Yetki kontrolü: Yazar değilse veya admin değilse ana sayfaya yönlendir
      if (!isAuthorOrAdmin.value) {
          router.push('/');
          return;
      }
      postTitle.value = postStore.selectedPost.title;
      postContent.value = postStore.selectedPost.content;
    } else if (!postStore.loading) {
      // Yazı bulunamazsa veya hata olursa
      alert(postStore.error || 'Düzenlenecek yazı bulunamadı.');
      router.push('/'); // Ana sayfaya geri dön
    }
  }
});

// `postStore.selectedPost` değiştiğinde form alanlarını güncelle
watch(() => postStore.selectedPost, (newPost) => {
  if (newPost && !isNewPost && isAuthorOrAdmin.value) {
    postTitle.value = newPost.title;
    postContent.value = newPost.content;
  }
}, { immediate: true }); // Bileşen mount edildiğinde de çalışmasını sağlar

const handleSubmit = async () => {
  const postData = {
    title: postTitle.value,
    content: postContent.value,
  };

  try {
    if (isNewPost) {
      // Yeni yazı oluştur
      await postStore.createPost(postData);
      alert('Yazı başarıyla oluşturuldu!');
      router.push('/'); // Anasayfaya veya yeni oluşturulan yazının detayına yönlendir
    } else {
      // Mevcut yazıyı güncelle
      await postStore.updatePost(postId, postData);
      alert('Yazı başarıyla güncellendi!');
      router.push(`/posts/${postId}`); // Güncellenen yazının detay sayfasına yönlendir
    }
  } catch (err) {
    // Hata mesajı Pinia store tarafından zaten set edildiği için burada özel bir işlem yapmaya gerek yok
    console.error('Yazı işlemi sırasında hata:', err);
  }
};
</script>

<style scoped>
.edit-post-container {
  max-width: 700px;
  margin: 50px auto;
  padding: 35px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.page-title {
  font-size: 2.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #555;
  font-size: 1.1rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 150px;
}

.submit-button {
  background-color: #28a745;
  color: white;
  padding: 14px 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 15px;
}

.submit-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  display: inline-block;
  background-color: #6c757d;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
  transition: background-color 0.3s ease;
  align-self: center; /* Ortalamak için */
}

.cancel-button:hover {
  background-color: #5a6268;
}

.loading-message, .error-message {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 1rem;
  border-radius: 8px;
}

.loading-message {
  background-color: #e6f7ff;
  color: #0056b3;
  border: 1px solid #91d5ff;
}

.error-message {
  background-color: #f8d7da;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}
</style>