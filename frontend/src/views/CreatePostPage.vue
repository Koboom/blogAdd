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
/* Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');

.create-post-container {
  min-height: 100vh; /* Konteynerin dikeyde tüm viewport yüksekliğini kaplamasını sağlar */
  background-color: #f3f4f6; /* Açık gri arka plan */
  display: flex;
  flex-direction: column; /* İçeriği dikeyde sırala */
  align-items: center; /* İçeriği yatayda ortala */
  justify-content: center; /* İçeriği dikeyde ortala (eğer kısa ise) */
  padding: 3rem 1rem; /* Üst/alt 48px, sol/sağ 16px boşluk */
  font-family: 'Inter', sans-serif;
  box-sizing: border-box; /* Padding'in genişliğe dahil olmasını sağlar */
}

.create-post-container > h1 {
  margin-top: 0; /* Başlık üstündeki varsayılan boşluğu kaldır */
  margin-bottom: 2.5rem; /* Başlık altındaki boşluğu artırıldı (2rem'den 2.5rem'e) */
}

.post-form {
  max-width: 1000px; /* Maksimum genişlik */
  width: 100%; /* Küçük ekranlarda tam genişlik */
  background-color: #ffffff; /* Beyaz kart arka planı */
  padding: 70px 80px; /* İç boşluklar artırıldı (60px 70px'ten 70px 80px'e) */
  border-radius: 12px; /* Köşeleri yuvarlatılmış */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Hafif gölge */
  display: flex;
  flex-direction: column;
  gap: 4rem; /* Bölümler arası boşluk artırıldı (3.5rem'den 4rem'e) */
  box-sizing: border-box; /* Padding'in genişliğe dahil olmasını sağlar */
}

h1 {
  font-size: 2.5rem; /* Daha büyük başlık fontu */
  font-weight: 800; /* Kalın font */
  color: #1a202c; /* Koyu gri */
  text-align: center; /* Başlığı ortala */
}

.post-form-container .post-form { /* Sadece .post-form-container içindeki .post-form'u etkile */
    margin-top: 0; /* Formun üstündeki varsayılan boşluğu kaldır */
}

.error-message,
.success-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: left;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  font-size: 1.15rem; /* Etiket fontu biraz daha büyütüldü (1.1rem'den 1.15rem'e) */
  font-weight: 500;
  color: #374151; /* Koyu gri */
  margin-bottom: 1rem; /* Etiket altındaki boşluk artırıldı (0.75rem'den 1rem'e) */
}

input[type="text"],
textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  padding: 1.5rem 1.75rem; /* Input/textarea padding'i artırıldı (1.25rem 1.5rem'den 1.5rem 1.75rem'e) */
  border: 1px solid #d1d5db; /* Açık gri kenarlık */
  border-radius: 8px;
  font-size: 1.15rem; /* Input/textarea fontu biraz büyütüldü (1.1rem'den 1.15rem'e) */
  color: #1f2937; /* Koyu metin rengi */
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Hafif gölge */
  box-sizing: border-box; /* Padding'in genişliğe dahil olmasını sağlar */
}

input[type="text"]::placeholder,
textarea::placeholder {
  color: #9ca3af; /* Yer tutucu metin rengi */
}

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: #6366f1; /* Odaklandığında mor kenarlık */
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5); /* Odaklandığında mor gölge */
}

textarea {
  resize: vertical;
  min-height: 70vh; /* KRİTİK: İçerik alanının viewport yüksekliğinin ~2/3'ünü kaplamasını sağlar (65vh'den 70vh'ye) */
  max-height: 90vh; /* Çok uzun olmasını engellemek için maksimum yükseklik (85vh'den 90vh'ye) */
}

.image-preview-container {
  margin-top: 2rem; /* Üst boşluk artırıldı (1.5rem'den 2rem'e) */
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%; /* Tam genişlik */
  max-width: 450px; /* Maksimum genişlik artırıldı (400px'ten 450px'e) */
  height: 300px; /* Sabit yükseklik artırıldı (250px'ten 300px'e) */
  margin-left: auto; /* Ortalamak için */
  margin-right: auto; /* Ortalamak için */
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain; /* Görseli kapsayıcıya sığdırır */
}

.remove-image-button {
  position: absolute;
  top: 10px; /* Konumu ayarlandı */
  right: 10px; /* Konumu ayarlandı */
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px; /* Boyut artırıldı */
  height: 35px; /* Boyut artırıldı */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem; /* Font boyutu artırıldı */
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.remove-image-button:hover {
  background-color: rgba(220, 53, 69, 1);
}

button[type="submit"] {
  width: 100%;
  padding: 1.5rem 1.75rem; /* Buton padding'i artırıldı (1.25rem 1.5rem'den 1.5rem 1.75rem'e) */
  background-color: #4f46e5; /* İndigo arka plan */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.3rem; /* Buton fontu biraz daha büyütüldü (1.2rem'den 1.3rem'e) */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 3rem; /* Üst boşluk artırıldı (2.5rem'den 3rem'e) */
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #4338ca; /* Hover'da daha koyu indigo */
  transform: translateY(-2px);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7; /* Devre dışı bırakıldığında daha soluk */
}

.back-button {
  display: inline-block;
  margin-top: 2.5rem; /* Geri butonunun üstündeki boşluk artırıldı (2rem'den 2.5rem'e) */
  padding: 0.85rem 1.75rem; /* Padding artırıldı */
  background-color: #6c757d;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem; /* Font boyutu artırıldı */
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.back-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

/* Responsive Styles for smaller screens */
@media (max-width: 768px) { /* Tablet ve mobil ekranlar için */
  .post-form-container {
    padding: 2rem 1rem; /* Daha az padding */
    margin: 20px auto; /* Üst boşluğu azalt */
  }
  .post-form {
    padding: 1.5rem 1.5rem; /* Kart içi padding'i azalt */
    gap: 2rem; /* Boşlukları azalt */
  }
  h1 {
    font-size: 2rem; /* Başlık fontunu küçült */
    margin-bottom: 1.5rem;
  }
  .form-label {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  input[type="text"],
  textarea {
    padding: 1rem 1.2rem;
    font-size: 1rem;
  }
  textarea {
    min-height: 55vh; /* Mobil ekranlarda da yüksekliği koru (50vh'den 55vh'ye) */
  }
  button[type="submit"] {
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }
  .image-preview-container {
    height: 200px; /* Mobil önizleme yüksekliği */
  }
  .back-button {
    margin-top: 1.5rem;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) { /* Çok küçük mobil ekranlar için */
  .post-form-container {
    padding: 1rem 0.5rem;
    margin: 10px auto;
  }
  .post-form {
    padding: 1rem;
    gap: 1.5rem;
  }
  h1 {
    font-size: 1.8rem;
  }
  textarea {
    min-height: 50vh; /* Çok küçük ekranlarda biraz daha küçült (45vh'den 50vh'ye) */
  }
}
</style>