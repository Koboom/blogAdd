<script>
import { useAuthStore } from '../stores/auth'; // Auth store'u içeri aktar

export default {
  name: 'AuthSuccessPage',
  mounted() {
    const authStore = useAuthStore(); // Auth store'u kullan

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userDataString = urlParams.get('user'); // Backend'den user bilgisini de göndereceğimizi varsayalım

    if (token) {
      let user = null;
      if (userDataString) {
        try {
          user = JSON.parse(decodeURIComponent(userDataString)); // URL'den gelen user bilgisini ayrıştır
        } catch (e) {
          console.error("Kullanıcı verisi ayrıştırılırken hata oluştu:", e);
        }
      }

      console.log('Alınan Token:', token);
      console.log('Alınan Kullanıcı Verisi:', user);

      // Pinia store aracılığıyla token ve kullanıcıyı kaydet
      authStore.setAuthFromGoogle(token, user);
      this.$router.push('/'); // Başarılı girişte ana sayfaya yönlendir
    } else {
      console.error('URL\'de token bulunamadı.');
      authStore.error = 'Google ile giriş başarısız oldu: Token bulunamadı.';
      this.$router.push('/login'); // Token yoksa giriş sayfasına yönlendir
    }
  }
}
</script>