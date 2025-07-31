<template>
  <div class="admin-dashboard-container">
    <div class="dashboard-card">
      <h1 class="main-title">Admin Panel</h1>
      <p class="subtitle">Manage users, posts, and system settings here.</p>

      <!-- İstatistikler Bölümü -->
      <section class="stats-section">
        <h2 class="section-title">General Statistics</h2>
        <div v-if="userStore.statsLoading" class="loading-message">
          İstatistikler yükleniyor...
        </div>
        <div v-else-if="userStore.statsError" class="error-alert">
          <strong class="error-bold">Mistake!</strong>
          <span class="error-text"> {{ userStore.statsError }}</span>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total Number of Users:</span>
            <span class="stat-value">{{ userStore.adminStats.totalUsers }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Number of Posts:</span>
            <span class="stat-value">{{ userStore.adminStats.totalPosts }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Number of Unpublished Posts:</span>
            <span class="stat-value">{{ userStore.adminStats.unpublishedPosts }}</span>
          </div>
        </div>
      </section>

      <!-- Yüklenme Durumu (Kullanıcı Listesi ve Yayınlanmamış Gönderi Listesi İçin) -->
      <div v-if="userStore.loading || postStore.loading" class="loading-message">
        Veriler yükleniyor...
      </div>

      <!-- Hata Durumu (Kullanıcı Listesi İçin) -->
      <div v-if="userStore.error" class="error-alert">
        <strong class="error-bold">Mistake!</strong>
        <span class="error-text"> {{ userStore.error }}</span>
      </div>

      <!-- Kullanıcı Yönetimi Bölümü -->
      <section class="user-management-section">
        <h2 class="section-title">User Management</h2>
        <div v-if="userStore.users.length === 0 && !userStore.loading">
          <p class="no-data-message">There are no registered users yet.</p>
        </div>
        <div v-else class="user-list">
          <div v-for="user in userStore.users" :key="user._id" class="user-card">
            <div class="user-info">
              <span class="info-label">User name:</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="user-info">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="user-info">
              <span class="info-label">Role:</span>
              <select v-model="user.role" @change="handleRoleChange(user)" class="role-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button @click="saveUserRole(user)" :disabled="user.isSaving" class="save-button">
              {{ user.isSaving ? 'Saving...' : 'Save Role' }}
            </button>
            <button @click="confirmDeleteUser(user)" class="delete-button">Delete User</button>
          </div>
        </div>
      </section>

      <!-- Yayınlanmamış Gönderiler Bölümü -->
      <section class="unpublished-posts-section">
        <h2 class="section-title">Unpublished Posts</h2>
        <div v-if="postStore.unpublishedPosts.length === 0 && !postStore.loading">
          <p class="no-data-message">There are no posts waiting to be published.</p>
        </div>
        <div v-else class="post-list">
          <div v-for="post in postStore.unpublishedPosts" :key="post._id" class="post-card">
            <div class="post-info">
              <span class="info-label">Title:</span>
              <span class="info-value">{{ post.title }}</span>
            </div>
            <div class="post-info">
              <span class="info-label">Writer:</span>
              <span class="info-value">{{ post.author?.username || 'Bilinmiyor' }}</span>
            </div>
            <div class="post-info">
              <span class="info-label">Creation:</span>
              <span class="info-value">{{ new Date(post.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="post-actions">
              <button @click="viewPost(post._id)" class="view-button">View</button>
              <button @click="approvePost(post)" :disabled="post.isApproving" class="approve-button">
                {{ post.isApproving ? 'Approving...' : 'Publish' }}
              </button>
              <button @click="confirmDeletePost(post)" class="delete-button">Sil</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { usePostStore } from '../stores/post'; // Post store'u içeri aktarın
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const postStore = usePostStore(); // Post store instance'ı
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (authStore.isAdmin) {
    // Kullanıcı listesini, istatistikleri ve yayınlanmamış gönderileri aynı anda çek
    await Promise.all([
      userStore.fetchUsers(),
      userStore.fetchAdminStats(),
      postStore.fetchUnpublishedPosts() // Yayınlanmamış gönderileri çek
    ]);

    userStore.users.forEach(user => {
      user.isSaving = false;
    });
    postStore.unpublishedPosts.forEach(post => { // isApproving özelliği ekle
      post.isApproving = false;
    });
  } else {
    // Admin değilse router guard yönlendirmeli, ama yine de mesaj verelim
    alert('Bu sayfaya erişim yetkiniz yok. Yönetici olarak giriş yapmalısınız.');
    router.push('/');
  }
});

const handleRoleChange = (user) => {
  console.log(`Kullanıcı ${user.username} için yeni rol: ${user.role}`);
};

const saveUserRole = async (user) => {
  user.isSaving = true;
  try {
    await userStore.updateUserRole(user._id, user.role);
    alert(`Kullanıcı ${user.username} rolü başarıyla güncellendi.`);
  } catch (error) {
    alert(`Kullanıcı rolü güncellenirken hata oluştu: ${error.message}`);
  } finally {
    user.isSaving = false;
  }
};

const confirmDeleteUser = async (user) => {
  if (confirm(`Kullanıcı ${user.username} (${user.email}) silinecek. Emin misiniz?`)) {
    try {
      await userStore.deleteUser(user._id);
      alert(`Kullanıcı ${user.username} başarıyla silindi.`);
    } catch (error) {
      alert(`Kullanıcı silinirken hata oluştu: ${error.message}`);
    }
  }
};

// Yeni fonksiyonlar: Gönderi Yönetimi için
const viewPost = (postId) => {
  router.push(`/posts/${postId}`); // Gönderi detay sayfasına yönlendir
};

const approvePost = async (post) => {
  post.isApproving = true; // Onaylama durumunu başlat
  try {
    await postStore.updatePostPublicationStatus(post._id, true); // isPublished'ı true yap
    alert(`Gönderi "${post.title}" başarıyla yayınlandı.`);
    // İstatistikleri güncelle
    await userStore.fetchAdminStats();
  } catch (error) {
    alert(`Gönderi yayınlanırken hata oluştu: ${error.message}`);
  } finally {
    post.isApproving = false; // Onaylama durumunu bitir
  }
};

const confirmDeletePost = async (post) => {
  if (confirm(`Gönderi "${post.title}" silinecek. Emin misiniz?`)) {
    try {
      await postStore.deletePost(post._id);
      alert(`Gönderi "${post.title}" başarıyla silindi.`);
      // İstatistikleri güncelle
      await userStore.fetchAdminStats();
    } catch (error) {
      alert(`Gönderi silinirken hata oluştu: ${error.message}`);
    }
  }
};
</script>

<style scoped>
/* Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');

.admin-dashboard-container {
  min-height: 100vh;
  background-color: #f3f4f6; /* Açık gri arka plan */
  display: flex;
  align-items: flex-start; /* İçeriği yukarı hizala */
  justify-content: center;
  padding: 3rem 1rem;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.dashboard-card {
  max-width: 1200px; /* Daha geniş bir kart */
  width: 100%;
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.main-title {
  font-size: 2.8rem; /* Biraz daha büyük başlık */
  font-weight: 800;
  color: #1a202c;
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #4a5568;
  text-align: center;
  margin-bottom: 2rem;
}

.loading-message {
  text-align: center;
  color: #2563eb;
  font-weight: 500;
  padding: 1rem;
}

.error-alert {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.25rem;
  position: relative;
  text-align: left;
}

.error-bold {
  font-weight: 700;
}

.error-text {
  display: block;
}

/* İstatistikler Bölümü Stilleri */
.stats-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  background-color: #fdfdfe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-card {
  background-color: #e0f2fe; /* Açık mavi */
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 1rem;
  color: #2563eb; /* Mavi */
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e3a8a; /* Koyu mavi */
}

/* Ortak Bölüm Stilleri */
.user-management-section,
.unpublished-posts-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  background-color: #fdfdfe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 2rem; /* Daha büyük bölüm başlığı */
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 0.75rem;
}

.no-data-message {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 1rem;
}

/* Kullanıcı Listesi Stilleri */
.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsive grid */
  gap: 1.5rem; /* Kartlar arası boşluk */
}

.user-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
  width: 90px; /* Etiketler için sabit genişlik */
  flex-shrink: 0;
}

.info-value {
  color: #2d3748;
  flex-grow: 1;
  word-break: break-all;
}

.role-select {
  flex-grow: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: #f9fafb;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.role-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.save-button,
.delete-button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  width: 100%;
  margin-top: 0.5rem;
}

.save-button {
  background-color: #4f46e5; /* İndigo */
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.delete-button {
  background-color: #ef4444; /* Kırmızı */
  color: white;
}

.delete-button:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

/* Yayınlanmamış Gönderi Listesi Stilleri */
.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-info {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.view-button,
.approve-button,
.post-card .delete-button { /* .post-card içindeki delete-button'ı hedefle */
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  flex-grow: 1; /* Butonların eşit genişlikte olmasını sağlar */
  text-align: center;
}

.view-button {
  background-color: #3b82f6; /* Mavi */
  color: white;
}

.view-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.approve-button {
  background-color: #10b981; /* Yeşil */
  color: white;
}

.approve-button:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
}

.approve-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* .post-card içindeki delete-button için özel stil */
.post-card .delete-button {
  background-color: #ef4444; /* Kırmızı */
  color: white;
}

.post-card .delete-button:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}


/* Responsive Styles */
@media (max-width: 1024px) { /* Tabletler için */
  .dashboard-card {
    max-width: 900px;
    padding: 2rem 2.5rem;
  }
  .main-title {
    font-size: 2.4rem;
  }
  .section-title {
    font-size: 1.8rem;
  }
  .user-list, .post-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  .stats-grid {
    grid-template-columns: 1fr; /* Tek sütun */
  }
}

@media (max-width: 768px) { /* Mobil cihazlar için */
  .admin-dashboard-container {
    padding: 2rem 0.5rem;
  }
  .dashboard-card {
    padding: 1.5rem 1.5rem;
    gap: 1.5rem;
  }
  .main-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }
  .user-list, .post-list {
    grid-template-columns: 1fr; /* Tek sütun */
  }
  .user-card, .post-card {
    padding: 1rem;
  }
  .info-label {
    width: 80px;
  }
  .save-button, .delete-button, .view-button, .approve-button {
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
  }
  .stat-value {
    font-size: 2rem;
  }
  .post-actions {
    flex-direction: column; /* Mobil görünümde butonları alt alta sırala */
    gap: 0.75rem;
  }
}

@media (max-width: 480px) { /* Küçük mobil cihazlar için */
  .dashboard-card {
    padding: 1rem;
  }
  .main-title {
    font-size: 1.8rem;
  }
  .section-title {
    font-size: 1.4rem;
  }
}
</style>