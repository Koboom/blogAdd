<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/">BlogApp</router-link>
      </div>
      <div class="navbar-links">
        <router-link to="/">Anasayfa</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/create">Yeni Yazı Oluştur</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile">Profil</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login">Giriş Yap</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register">Kayıt Ol</router-link>
        <a v-if="authStore.isAuthenticated" @click="handleLogout" class="logout-link">
          Çıkış Yap ({{ authStore.userNameOrEmail }})
        </a>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login'); // Çıkış yapınca giriş sayfasına yönlendir
};
</script>

<style>
/* Stil kodlarınız burada devam ediyor... */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px; /* Navbar için boşluk */
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 15px 30px;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.8rem;
  font-weight: bold;
}

.navbar-links a, .navbar-links .logout-link {
  color: white;
  text-decoration: none;
  margin-left: 25px;
  font-size: 1.1rem;
  transition: color 0.3s ease;
  cursor: pointer;
}

.navbar-links a:hover, .navbar-links .logout-link:hover {
  color: #42b983; /* Vue yeşili */
}

.logout-link {
  font-style: italic;
  font-weight: normal;
}
</style>