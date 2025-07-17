<template>
  <header>
    <nav>
      <router-link to="/">Anasayfa</router-link> |

      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login">Giriş Yap</router-link> |
        <router-link to="/register">Kayıt Ol</router-link>
      </template>

      <template v-else>
        <router-link to="/profile">Profil</router-link> |
        <a href="#" @click.prevent="handleLogout">Çıkış Yap ({{ authStore.currentUser?.username }})</a>
      </template>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<script setup>
import { useAuthStore } from './stores/auth'; // Auth store'u içeri aktar
import { onMounted } from 'vue'; // onMounted hook'unu içeri aktar

const authStore = useAuthStore();

// Uygulama yüklendiğinde veya yenilendiğinde kimlik doğrulama durumunu kontrol et
onMounted(() => {
  authStore.checkAuth();
});

const handleLogout = () => {
  authStore.logout();
};
</script>

<style scoped>
header {
  line-height: 1.5;
  padding: 1rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

nav {
  width: 100%;
  font-size: 1rem;
  text-align: center;
  margin-top: 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>