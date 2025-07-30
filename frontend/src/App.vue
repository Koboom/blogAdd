<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/">BlogApp</router-link>
      </div>
      <div class="navbar-links">
        <router-link to="/">Home</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/create">Create New Post</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile">Profile</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login">Login</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register">Sign up</router-link>
        <a v-if="authStore.isAuthenticated" @click="handleLogout" class="logout-link">
          Çıkış Yap ({{ authStore.userNameOrEmail }})
        </a>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
// ... (script setup kısmı aynı kalacak)
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login'); // Çıkış yaptıktan sonra giriş sayfasına yönlendir
};
</script>

<style scoped>
/* Genel Uygulama Düzeni */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh; /* Minimum tam ekran yüksekliği */
  display: flex;
  flex-direction: column;
}

/* Navigasyon Çubuğu */
.navbar {
  display: flex;
  justify-content: space-between; /* Marka sola, bağlantılar sağa */
  align-items: center; /* Dikeyde ortala */
  padding: 15px 30px;
  background-color: #2c3e50; /* Koyu lacivert */
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); /* Daha belirgin gölge */
  flex-wrap: wrap; /* Küçük ekranlarda alt satıra geçiş */
  gap: 15px; /* Öğeler arası varsayılan boşluk */
}

.navbar-brand {
  font-size: 1.9rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.navbar-brand a {
  color: #42b983; /* Vue yeşili vurgu */
  text-decoration: none;
  transition: color 0.3s ease-in-out;
}

.navbar-brand a:hover {
  color: #66cc99;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 15px; /* Bağlantılar arası boşluk */
  flex-wrap: wrap; /* Küçük ekranlarda alt satıra geçiş */
  justify-content: center; /* Küçük ekranlarda ortala */
}

.navbar-links a,
.navbar-links .logout-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px; /* Daha yuvarlak köşeler */
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  white-space: nowrap; /* Metnin tek satırda kalmasını sağlar */
  border: 1px solid transparent; /* Varsayılan şeffaf kenarlık */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Hafif buton gölgesi */
}

/* Hover ve Aktif Durumlar */
.navbar-links a:hover,
.navbar-links .logout-link:hover {
  background-color: rgba(255, 255, 255, 0.15); /* Hafif beyaz transparan */
  transform: translateY(-2px); /* Hafif yukarı kalkma efekti */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* Hover'da daha belirgin gölge */
}

.navbar-links a.router-link-exact-active {
  background-color: #42b983; /* Aktif bağlantı için Vue yeşili */
  border-color: #36a273;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

/* Belirli Buton Vurguları */

/* Yeni Yazı Oluştur butonu */
.navbar-links a[to="/create"] {
  background-color: #1abc9c; /* Turkuaz tonu */
  border-color: #16a085;
  color: white;
}
.navbar-links a[to="/create"]:hover {
  background-color: #16a085;
  border-color: #138d75;
}

/* Giriş Yap / Kayıt Ol butonları */
.navbar-links a[to="/login"],
.navbar-links a[to="/register"] {
  background-color: #3498db; /* Mavi tonu */
  border-color: #2980b9;
  color: white;
}
.navbar-links a[to="/login"]:hover,
.navbar-links a[to="/register"]:hover {
  background-color: #2980b9;
  border-color: #24719c;
}

/* Çıkış Yap bağlantısı */
.logout-link {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.logout-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Router View için ana içerik alanı */
.router-view-container {
  flex-grow: 1; /* Navbar dışındaki alanı doldur */
  padding: 20px;
}

/* Küçük ekranlar için medya sorgusu */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column; /* Dikey hizalama */
    align-items: flex-start; /* Sola hizala */
    padding: 15px 20px;
  }

  .navbar-brand {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .navbar-links {
    flex-direction: column; /* Bağlantıları alt alta sırala */
    width: 100%; /* Tam genişlik kapla */
    gap: 10px; /* Dikey boşluk */
    align-items: stretch; /* Yatayda ger */
  }

  .navbar-links a,
  .navbar-links .logout-link {
    width: 100%; /* Tam genişlik kapla */
    text-align: center; /* Metni ortala */
    margin: 0; /* Boşlukları kaldır */
  }
}
</style>