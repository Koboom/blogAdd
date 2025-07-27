<template>
  <div class="home-page-container">
    <h1 class="main-title">Blog Uygulaması</h1>
    <p class="subtitle">En son blog yazılarını keşfedin veya kendi yazılarınızı oluşturun.</p>

    <!-- Admin Paneli Düğmesi (Sadece Adminler İçin Görünür) -->
    <router-link v-if="authStore.isAuthenticated && authStore.isAdmin" to="/admin-dashboard" class="admin-dashboard-button">
      Admin Paneli
    </router-link>

    <!-- Diğer içerikleriniz buraya gelecek, örneğin blog yazıları listesi -->
    <div class="posts-section">
      <h2 class="section-title">En Son Yazılar</h2>
      <div v-if="postStore.loading" class="loading-message">Yazılar yükleniyor...</div>
      <div v-else-if="postStore.error" class="error-message">{{ postStore.error }}</div>
      <div v-else-if="postStore.posts.length === 0" class="no-posts-message">Henüz hiç blog yazısı bulunmamaktadır.</div>
      <div v-else class="post-list">
        <div v-for="post in postStore.posts" :key="post._id" class="post-card">
          <img v-if="post.image" :src="getFullImageUrl(post.image)" alt="Post Image" class="post-image">
          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ truncateContent(post.content, 150) }}</p>
            <router-link :to="`/posts/${post._id}`" class="read-more-button">Devamını Oku</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth'; // Auth store'u içeri aktarın

const postStore = usePostStore();
const authStore = useAuthStore(); // Auth store instance'ı

onMounted(() => {
  postStore.fetchPosts(); // Tüm gönderileri çek
});

const truncateContent = (content, length) => {
  if (content.length <= length) {
    return content;
  }
  return content.substring(0, length) + '...';
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `http://localhost:5000${imagePath}`;
};
</script>

<style scoped>
/* Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');

.home-page-container {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 3rem 1rem;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  text-align: center;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 2.5rem;
}

.admin-dashboard-button {
  display: inline-block;
  padding: 0.85rem 1.75rem;
  background-color: #4f46e5; /* İndigo rengi */
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-bottom: 3rem; /* Diğer içeriklerden ayırmak için */
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); /* Hafif gölge */
}

.admin-dashboard-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

.posts-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 1rem;
}

.loading-message,
.error-message,
.no-posts-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-weight: 500;
}

.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.post-card {
  background-color: #fdfdfe;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #e2e8f0;
}

.post-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.post-excerpt {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.read-more-button {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #2563eb; /* Mavi tonu */
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  align-self: flex-start; /* Butonu sola hizala */
}

.read-more-button:hover {
  background-color: #1d4ed8;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .main-title {
    font-size: 3rem;
  }
  .subtitle {
    font-size: 1.1rem;
  }
  .posts-section {
    padding: 1.5rem;
  }
  .section-title {
    font-size: 2rem;
  }
  .post-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .home-page-container {
    padding: 2rem 0.5rem;
  }
  .main-title {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  .admin-dashboard-button {
    padding: 0.7rem 1.4rem;
    font-size: 1rem;
    margin-bottom: 2.5rem;
  }
  .posts-section {
    padding: 1rem;
  }
  .section-title {
    font-size: 1.8rem;
  }
  .post-list {
    grid-template-columns: 1fr; /* Tek sütun */
  }
  .post-image {
    height: 180px;
  }
  .post-content {
    padding: 1rem;
  }
  .post-title {
    font-size: 1.3rem;
  }
  .post-excerpt {
    font-size: 0.9rem;
  }
  .read-more-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
  .admin-dashboard-button {
    font-size: 0.9rem;
  }
  .section-title {
    font-size: 1.6rem;
  }
}
</style>
