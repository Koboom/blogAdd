<template>
  <div class="auth-container">
    <h1>Kayıt Ol</h1>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="username">Kullanıcı Adı:</label>
        <input type="text" id="username" v-model="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label for="email">E-posta:</label>
        <input type="email" id="email" v-model="email" required autocomplete="email">
      </div>
      <div class="form-group">
        <label for="password">Şifre:</label>
        <input type="password" id="password" v-model="password" required autocomplete="new-password">
      </div>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Kaydolunuyor...' : 'Kayıt Ol' }}
      </button>
    </form>

    <div class="auth-divider">VEYA</div>

    <button @click="handleGoogleLogin" class="google-login-button" :disabled="authStore.loading">
      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_Google__G__Reverse_RGB.png" alt="Google Logo" class="google-logo">
      Google ile Kayıt Ol
    </button>

    <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
    <p class="auth-link">Zaten hesabın var mı? <router-link to="/login">Giriş Yap</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // useRouter hook'u eklendi
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter(); // router instance'ı tanımlandı

const username = ref('');
const email = ref('');
const password = ref('');

const handleRegister = async () => {
  try {
    await authStore.register({ username: username.value, email: email.value, password: password.value });
    // Kayıt başarılı olduğunda kullanıcıyı ana sayfaya yönlendir
    router.push('/');
  } catch (err) {
    // Hata Pinia store tarafından yönetiliyor
    console.error('Kayıt hatası:', err);
  }
};

const handleGoogleLogin = () => {
  // Backend'in Google OAuth başlatma rotasına yönlendir
  window.location.href = 'http://localhost:5000/api/auth/google';
};
</script>

<style scoped>
/* Mevcut stilleriniz aynı kalacak */
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  text-align: center;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 25px;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #0056b3;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.auth-divider {
  margin: 25px 0;
  font-size: 0.9rem;
  color: #777;
  position: relative;
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #eee;
}

.auth-divider::before {
  left: 0;
}

.auth-divider::after {
  right: 0;
}

.google-login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4285f4;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  width: 100%;
}

.google-login-button:hover:not(:disabled) {
  background-color: #357ae8;
}

.google-login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.google-logo {
  width: 20px;
  height: 20px;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 0.95rem;
}

.auth-link {
  margin-top: 20px;
  font-size: 0.95rem;
  color: #555;
}

.auth-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>