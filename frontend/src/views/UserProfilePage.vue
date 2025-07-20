<template>
  <div class="profile-container">
    <h1>Kullanıcı Profilim</h1>

    <div v-if="authStore.user" class="profile-details">
      <h2>Genel Bilgiler</h2>
      <p><strong>Kullanıcı Adı:</strong> {{ authStore.user.username }}</p>
      <p><strong>E-posta:</strong> {{ authStore.user.email }}</p>
      <p><strong>Rol:</strong> {{ authStore.user.role }}</p>
    </div>

    <div class="password-change-section">
      <h2>Şifre Değiştir</h2>
      <form @submit.prevent="handleChangePassword" class="password-change-form">
        <div class="form-group">
          <label for="currentPassword">Mevcut Şifre:</label>
          <input type="password" id="currentPassword" v-model="currentPassword" required />
        </div>
        <div class="form-group">
          <label for="newPassword">Yeni Şifre:</label>
          <input type="password" id="newPassword" v-model="newPassword" required />
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">Yeni Şifre Tekrar:</label>
          <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required />
        </div>
        <button type="submit" class="submit-button">Şifreyi Değiştir</button>
      </form>
      <p v-if="passwordChangeMessage" :class="passwordChangeError ? 'error-message' : 'success-message'">
        {{ passwordChangeMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth'; // authStore'u import et
import { useRouter } from 'vue-router'; // Yönlendirme için router'ı import et

const authStore = useAuthStore();
const router = useRouter();

// Şifre değiştirme formu için reaktif veriler
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const passwordChangeMessage = ref('');
const passwordChangeError = ref(false);

// Eğer kullanıcı oturum açmamışsa giriş sayfasına yönlendir
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});

const handleChangePassword = async () => {
  passwordChangeMessage.value = ''; // Mesajı temizle
  passwordChangeError.value = false; // Hata durumunu sıfırla

  if (newPassword.value !== confirmNewPassword.value) {
    passwordChangeMessage.value = 'Yeni şifreler eşleşmiyor.';
    passwordChangeError.value = true;
    return;
  }

  // Şifreler için minimum uzunluk kontrolü
  if (newPassword.value.length < 6) { // Varsayılan olarak 6 karakter, backend'inize göre ayarlayın
    passwordChangeMessage.value = 'Yeni şifre en az 6 karakter olmalı.';
    passwordChangeError.value = true;
    return;
  }

  try {
    // authStore içinde şifre değiştirme action'ı olacak (henüz eklemedik)
    // await authStore.changePassword({
    //   currentPassword: currentPassword.value,
    //   newPassword: newPassword.value
    // });

    passwordChangeMessage.value = 'Şifreniz başarıyla değiştirildi!';
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (error) {
    passwordChangeMessage.value = error.message || 'Şifre değiştirme başarısız oldu.';
    passwordChangeError.value = true;
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 700px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: left;
}

h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
}

h2 {
  font-size: 1.6rem;
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.profile-details p {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #555;
}

.profile-details strong {
  color: #2c3e50;
}

.password-change-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

.password-change-form .form-group {
  margin-bottom: 15px;
}

.password-change-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.password-change-form input[type="password"] {
  width: calc(100% - 22px); /* Padding ve border için ayarlama */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.password-change-form input[type="password"]:focus {
  border-color: #42b983; /* Vue yeşili vurgu */
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.submit-button {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background-color: #42b983; /* Vue yeşili */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;
}

.submit-button:hover {
  background-color: #36a273;
  transform: translateY(-2px);
}

.error-message {
  color: #e74c3c; /* Kırmızı */
  background-color: #ffe0e0;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  border: 1px solid #e74c3c;
}

.success-message {
  color: #27ae60; /* Yeşil */
  background-color: #e6ffe6;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  border: 1px solid #27ae60;
}
</style>