<template>
  <header>
    <nav>
      <router-link to="/">Anasayfa</router-link> |
      <router-link to="/login">Giriş Yap</router-link> |
      <router-link to="/register">Kayıt Ol</router-link> |
      <router-link to="/profile">Profil</router-link>
      </nav>
  </header>
  <main>
    <router-view /> </main>
</template>

<script setup>
// Eğer Options API kullanıyorsanız, script setup'ı kaldırıp Options API syntax'ını kullanabilirsiniz.
// Şimdilik varsayılan Vite kurulumuyla gelen setup script'i kalsın.
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