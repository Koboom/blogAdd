<template>
  <div class="create-post-container">
    <h1>Yeni Blog Yazısı Oluştur</h1>
    <form @submit.prevent="createPost" class="post-form">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div class="form-group">
        <label for="title">Başlık:</label>
        <input type="text" id="title" v-model="title" required>
      </div>

      <div class="form-group">
        <label for="content">İçerik:</label>
        <textarea id="content" v-model="content" rows="10" required></textarea>
      </div>

      <div class="form-group">
        <label for="image">Resim Yükle:</label>
        <input type="file" id="image" @change="handleFileChange" accept="image/*">
        <div v-if="imagePreview" class="image-preview-container">
          <img :src="imagePreview" alt="Resim Önizleme" class="image-preview">
          <button @click="removeImage" class="remove-image-button">X</button>
        </div>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Oluşturuluyor...' : 'Yazı Oluştur' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Auth store'u içeri aktarın

const router = useRouter();
const authStore = useAuthStore();

const title = ref('');
const content = ref('');
const selectedFile = ref(null); // Seçilen dosyayı tutacak ref
const imagePreview = ref(null); // Resim önizlemesini tutacak ref

const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    // Resim önizlemesini oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    imagePreview.value = null;
  }
};

const removeImage = () => {
  selectedFile.value = null;
  imagePreview.value = null;
  // Input'un değerini de sıfırlayın
  const fileInput = document.getElementById('image');
  if (fileInput) fileInput.value = '';
};

const createPost = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const formData = new FormData(); // FormData nesnesi oluştur
    formData.append('title', title.value);
    formData.append('content', content.value);
    if (selectedFile.value) {
      formData.append('image', selectedFile.value); // Resmi FormData'ya ekle
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data', // ÖNEMLİ: Resim yüklerken bu başlık gerekli
        Authorization: `Bearer ${authStore.token}`, // Token'ı ekle
      },
    };

    const response = await axios.post('http://localhost:5000/api/posts', formData, config);

    successMessage.value = 'Blog yazısı başarıyla oluşturuldu!';
    title.value = '';
    content.value = '';
    removeImage(); // Resmi ve önizlemeyi temizle

    // Opsiyonel: Yazı oluşturulduktan sonra kullanıcıyı ana sayfaya yönlendir
    router.push('/');

  } catch (err) {
    console.error('Gönderi oluşturulurken hata oluştu:', err);
    error.value = err.response?.data?.message || 'Gönderi oluşturulamadı. Lütfen geçerli veriler sağlayın.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Mevcut stilleriniz */
.create-post-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
}

textarea {
  resize: vertical; /* Dikey yeniden boyutlandırmaya izin ver */
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #0056b3;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 0.95rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
}

.success-message {
  color: #28a745;
  margin-bottom: 15px;
  font-size: 0.95rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 5px;
}

/* YENİ EKLENECEK SİTİLLER BAŞLANGICI */
.image-preview-container {
  position: relative;
  width: 200px; /* Önizleme boyutu */
  height: 150px;
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain; /* Resmin container'a sığmasını sağlar */
}

.remove-image-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-image-button:hover {
  background-color: rgba(255, 0, 0, 0.9);
}
/* YENİ EKLENECEK SİTİLLER SONU */
</style>