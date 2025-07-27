<template>
  <div class="admin-dashboard-container">
    <div class="dashboard-card">
      <h1 class="main-title">Admin Paneli</h1>
      <p class="subtitle">Kullanıcıları ve sistem ayarlarını buradan yönetin.</p>

      <!-- İstatistikler Bölümü -->
      <section class="stats-section">
        <h2 class="section-title">Genel İstatistikler</h2>
        <div v-if="userStore.statsLoading" class="loading-message">
          İstatistikler yükleniyor...
        </div>
        <div v-else-if="userStore.statsError" class="error-alert">
          <strong class="error-bold">Hata!</strong>
          <span class="error-text"> {{ userStore.statsError }}</span>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Toplam Kullanıcı Sayısı:</span>
            <span class="stat-value">{{ userStore.adminStats.totalUsers }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Toplam Gönderi Sayısı:</span>
            <span class="stat-value">{{ userStore.adminStats.totalPosts }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Bekleyen Gönderi Sayısı:</span>
            <span class="stat-value">{{ userStore.adminStats.pendingPosts }}</span>
          </div>
        </div>
      </section>

      <!-- Yüklenme Durumu (Kullanıcı Listesi İçin) -->
      <div v-if="userStore.loading" class="loading-message">
        Kullanıcılar yükleniyor...
      </div>

      <!-- Hata Durumu (Kullanıcı Listesi İçin) -->
      <div v-if="userStore.error" class="error-alert">
        <strong class="error-bold">Hata!</strong>
        <span class="error-text"> {{ userStore.error }}</span>
      </div>

      <!-- Kullanıcı Listesi -->
      <section class="user-management-section">
        <h2 class="section-title">Kullanıcı Yönetimi</h2>
        <div v-if="userStore.users.length === 0 && !userStore.loading">
          <p class="no-users-message">Henüz kayıtlı kullanıcı bulunmamaktadır.</p>
        </div>
        <div v-else class="user-list">
          <div v-for="user in userStore.users" :key="user._id" class="user-card">
            <div class="user-info">
              <span class="info-label">Kullanıcı Adı:</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="user-info">
              <span class="info-label">E-posta:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="user-info">
              <span class="info-label">Rol:</span>
              <select v-model="user.role" @change="handleRoleChange(user)" class="role-select">
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button @click="saveUserRole(user)" :disabled="user.isSaving" class="save-button">
              {{ user.isSaving ? 'Kaydediliyor...' : 'Rolü Kaydet' }}
            </button>
            <button @click="confirmDeleteUser(user)" class="delete-button">Kullanıcıyı Sil</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useAuthStore } from '../stores/auth';

const userStore = useUserStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isAdmin) {
    // Kullanıcı listesini ve istatistikleri aynı anda çek
    await Promise.all([
      userStore.fetchUsers(),
      userStore.fetchAdminStats()
    ]);

    userStore.users.forEach(user => {
      user.isSaving = false;
    });
  } else {
    userStore.error = "Bu sayfaya erişim yetkiniz yok.";
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

/* Yeni İstatistikler Bölümü Stilleri */
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


.user-management-section {
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

.no-users-message {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 1rem;
}

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
  .user-list {
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
  .user-list {
    grid-template-columns: 1fr; /* Tek sütun */
  }
  .user-card {
    padding: 1rem;
  }
  .info-label {
    width: 80px;
  }
  .save-button, .delete-button {
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
  }
  .stat-value {
    font-size: 2rem;
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