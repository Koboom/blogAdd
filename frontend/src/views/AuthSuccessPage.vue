<template>
  <div>
    <h1>Google ile Giriş Başarılı!</h1>
    <p>Token işleniyor...</p>
  </div>
</template>
<script>
export default {
  name: 'AuthSuccessPage',
  mounted() {
    // Backend'den gelen token'ı URL'den al
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      console.log('Alınan Token:', token);
      // Token'ı localStorage'a kaydet (veya Vuex/Pinia'ya)
      localStorage.setItem('token', token);
      // Kullanıcıyı ana sayfaya veya başka bir rotaya yönlendir
      this.$router.push('/');
    } else {
      console.error('URL\'de token bulunamadı.');
      this.$router.push('/login'); // Token yoksa giriş sayfasına yönlendir
    }
  }
}
</script>