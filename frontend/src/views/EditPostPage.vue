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

.post-form-container > h1 {
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