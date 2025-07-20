<template>
  <div class="post-form-container">
    <h1>{{ isEditing ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı Oluştur' }}</h1>
    <form @submit.prevent="handleSubmit" class="post-form">
      <div v-if="postStore.error" class="error-message">{{ postStore.error }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div class="form-group">
        <label for="title">Başlık:</label>
        <input type="text" id="title" v-model="postData.title" required>
      </div>

      <div class="form-group">
        <label for="content">İçerik:</label>
        <textarea id="content" v-model="postData.content" rows="10" required></textarea>
      </div>

      <!-- Resim Yükleme Alanı -->
      <div class="form-group">
        <label for="image">Resim Yükle:</label>
        <input type="file" id="image" @change="handleFileChange" accept="image/*">

        <!-- Mevcut Resim ve Önizleme -->
        <div v-if="imagePreview || postData.image" class="image-preview-container">
          <img :src="imagePreview || getFullImageUrl(postData.image)" alt="Resim Önizleme" class="image-preview">
          <button @click="removeImage" class="remove-image-button">X</button>
        </div>
      </div>

      <button type="submit" :disabled="postStore.loading">
        {{ postStore.loading ? (isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (isEditing ? 'Yazıyı Güncelle' : 'Yazı Oluştur') }}
      </button>
    </form>
    <router-link to="/" class="back-button">Ana Sayfaya Dön</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const postStore = usePostStore();
const authStore = useAuthStore();

const postId = ref(route.params.id); // URL'den ID'yi al
const isEditing = computed(() => !!postId.value); // ID varsa düzenleme modundayız

const postData = ref({
  title: '',
  content: '',
  image: null, // Mevcut resmin URL'si
});
const selectedFile = ref(null); // Kullanıcının seçtiği yeni dosya
const imagePreview = ref(null); // Yeni seçilen dosyanın önizlemesi

const successMessage = ref(null);

// Bileşen yüklendiğinde veya rota değiştiğinde veriyi çek
onMounted(async () => {
  if (isEditing.value) {
    await postStore.fetchPostById(postId.value);
    if (postStore.postDetail) {
      postData.value.title = postStore.postDetail.title;
      postData.value.content = postStore.postDetail.content;
      postData.value.image = postStore.postDetail.image; // Mevcut resmi yükle
    } else {
      // Yazı bulunamazsa veya yetki yoksa ana sayfaya yönlendir
      alert('Yazı bulunamadı veya düzenlemeye yetkiniz yok.');
      router.push('/');
    }
  } else {
    // Yeni yazı oluşturma modunda, formu temizle
    postData.value = { title: '', content: '', image: null };
    selectedFile.value = null;
    imagePreview.value = null;
  }
});

// Router parametresi değiştiğinde (örn. /create'den /posts/:id/edit'e geçiş)
watch(() => route.params.id, (newId) => {
  postId.value = newId;
  // onMounted'daki mantığı burada tekrar çalıştır
  if (isEditing.value) {
    postStore.fetchPostById(postId.value).then(() => {
      if (postStore.postDetail) {
        postData.value.title = postStore.postDetail.title;
        postData.value.content = postStore.postDetail.content;
        postData.value.image = postStore.postDetail.image;
      } else {
        alert('Yazı bulunamadı veya düzenlemeye yetkiniz yok.');
        router.push('/');
      }
    });
  } else {
    postData.value = { title: '', content: '', image: null };
    selectedFile.value = null;
    imagePreview.value = null;
  }
}, { immediate: true }); // Bileşen ilk yüklendiğinde de çalışmasını sağlar

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
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
  postData.value.image = null; // Mevcut resmi de kaldır
  const fileInput = document.getElementById('image');
  if (fileInput) fileInput.value = ''; // Input'u temizle
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // Backend'in statik olarak sunduğu resim yolunu oluştur
  return `http://localhost:5000${imagePath}`;
};

const handleSubmit = async () => {
  successMessage.value = null;
  postStore.error = null; // Store'daki hatayı temizle

  const formData = new FormData();
  formData.append('title', postData.value.title);
  formData.append('content', postData.value.content);

  // Eğer yeni bir dosya seçildiyse
  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  } else if (postData.value.image === null && isEditing.value) {
    // Eğer düzenleme modundayız ve mevcut resim kaldırıldıysa, backend'e resmi silmesi gerektiğini belirt
    formData.append('image', 'REMOVE_IMAGE'); // Backend'de özel bir işaretçi olarak kullanılabilir
  }

  try {
    if (isEditing.value) {
      await postStore.updatePost(postId.value, formData);
      successMessage.value = 'Yazı başarıyla güncellendi!';
    } else {
      await postStore.createPost(formData);
      successMessage.value = 'Yazı başarıyla oluşturuldu!';
      // Yeni yazı oluşturulduktan sonra formu temizle
      postData.value = { title: '', content: '', image: null };
      selectedFile.value = null;
      imagePreview.value = null;
    }
    router.push('/'); // İşlem başarılı olduktan sonra ana sayfaya yönlendir
  } catch (err) {
    // Hata Pinia store tarafından yönetiliyor ve gösteriliyor
    console.error('İşlem sırasında hata oluştu:', err);
  }
};
</script>

<style scoped>
/* Genel form konteyneri stilleri */
.post-form-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 35px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 700;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  font-size: 1.05rem;
  color: #555;
  margin-bottom: 10px;
  font-weight: 600;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1.05rem;
  color: #333;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  min-height: 150px;
}

input[type="text"]:focus,
textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

input[type="file"] {
  padding: 10px 0;
}

button[type="submit"] {
  width: 100%;
  padding: 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 15px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: left;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: left;
}

.image-preview-container {
  position: relative;
  width: 250px; /* Önizleme boyutu */
  height: 180px;
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain;
}

.remove-image-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.remove-image-button:hover {
  background-color: rgba(220, 53, 69, 1);
}

.back-button {
  display: inline-block;
  margin-top: 30px;
  padding: 12px 25px;
  background-color: #6c757d;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.back-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}
</style>