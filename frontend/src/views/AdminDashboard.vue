<template>
  <div class="admin-dashboard-container">
    <h1>Admin Paneli</h1>
    <p>Hoş geldiniz, Yönetici! Burası sadece yöneticilere özel içeriktir.</p>
    <p>Toplam Kullanıcı Sayısı: <strong>{{ totalUsers }}</strong></p>
    <p>Bekleyen Gönderi Sayısı: <strong>{{ pendingPosts }}</strong></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const totalUsers = ref(0);
const pendingPosts = ref(0);

onMounted(() => {
  // Kullanıcının admin olup olmadığını kontrol et
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    alert('Bu sayfaya erişim yetkiniz yok. Yönetici olarak giriş yapmalısınız.');
    router.push('/'); // Admin değilse ana sayfaya yönlendir
  }

  // Buraya admin paneli verilerini çekme mantığı eklenecek (API çağrıları)
  // Örneğin: fetchAdminStats();
  // Şimdilik varsayılan değerler kullanıyoruz.
  totalUsers.value = 42; // API'den gelecek
  pendingPosts.value = 5; // API'den gelecek
});
</script>

<style scoped>
.admin-dashboard-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 5px solid #e74c3c; /* Admin paneli vurgusu */
}

h1 {
  font-size: 2.5rem;
  color: #e74c3c; /* Kırmızı tonu */
  margin-bottom: 25px;
}

p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
}

strong {
  color: #333;
}
</style>