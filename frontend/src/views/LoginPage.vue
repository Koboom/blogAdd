<template>
  <div class="login-container">
    <h1>Giriş Yap</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">E-posta:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Şifre:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button" :disabled="authStore.loading">
        {{ authStore.loading ? 'Yükleniyor...' : 'Giriş Yap' }}
      </button>
      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
      <router-link to="/register" class="register-link">Hesabın yok mu? Kayıt ol.</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    // Giriş işlemini Pinia store üzerinden başlat
    await authStore.login({ email: email.value, password: password.value });

    // Giriş başarılı olduysa, kullanıcının rolüne göre yönlendir
    if (authStore.isAdmin) {
      console.log('Admin olarak giriş yapıldı, admin paneline yönlendiriliyor.');
      router.push('/admin-dashboard'); // Eğer admin ise admin paneline yönlendir
    } else {
      console.log('Kullanıcı olarak giriş yapıldı, ana sayfaya yönlendiriliyor.');
      router.push('/'); // Admin değilse ana sayfaya yönlendir
    }

  } catch (error) {
    // Hata zaten authStore tarafından yönetiliyor ve error mesajı gösteriliyor
    console.error('Giriş hatası:', error);
  }
};
</script>

<style scoped>
/* Mevcut stil kodunuz */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 25px;
}

.login-form .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.login-form label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
}

.login-form input[type="email"],
.login-form input[type="password"] {
  width: calc(100% - 22px); /* Padding ve border için ayarlama */
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.login-form input[type="email"]:focus,
.login-form input[type="password"]:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #36a273;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 0.95rem;
  background-color: #ffe0e0;
  border: 1px solid #e74c3c;
  padding: 10px;
  border-radius: 5px;
}

.register-link {
  display: block;
  margin-top: 25px;
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>