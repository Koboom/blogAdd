<template>
  <div class="create-post-container">
    <h1>Yeni Blog Yazısı Oluştur</h1>
    <form @submit.prevent="handleSubmit" class="post-form">
      <div class="form-group">
        <label for="title">Başlık:</label>
        <input type="text" id="title" v-model="title" required />
      </div>

      <div class="form-group">
        <label for="content">İçerik:</label>
        <textarea id="content" v-model="content" rows="10" required></textarea>
      </div>

      <div v-if="postStore.loading" class="loading-message">Yazı oluşturuluyor...</div>
      <div v-if="postStore.error" class="error-message">Hata: {{ postStore.error }}</div>

      <button type="submit" :disabled="postStore.loading" class="submit-button">
        Yazıyı Oluştur
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';

const router = useRouter();
const postStore = usePostStore();

const title = ref('');
const content = ref('');

const handleSubmit = async () => {
  postStore.clearError(); // Önceki hataları temizle
  try {
    const newPost = {
      title: title.value,
      content: content.value,
    };
    await postStore.createPost(newPost);
    alert('Yazı başarıyla oluşturuldu!');
    router.push('/'); // Yazı oluşturulduktan sonra Anasayfa'ya yönlendir
  } catch (error) {
    // Hata zaten store tarafından set edildiği için burada özel bir işlem yapmaya gerek yok
    console.error('Yazı oluşturulurken bir sorun oluştu:', error);
  }
};
</script>

<style scoped>
.create-post-container {
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
  box-sizing: border-box; /* Padding'i width içine dahil et */
}

.form-group textarea {
  resize: vertical; /* Dikey olarak yeniden boyutlandırmaya izin ver */
  min-height: 150px;
}

.submit-button {
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  align-self: flex-end; /* Butonu sağa hizala */
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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