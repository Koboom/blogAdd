import axios from 'axios';

// Backend API'nizin base URL'i
// Docker ortamında backend servisine doğrudan erişmek için
// eğer backend ve frontend aynı docker-compose ağındaysa backend servis adını kullanabilirsiniz.
// Şimdilik geliştirme ortamı için localhost:5000 kullanalım.
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Çerezleri (cookie) ve kimlik doğrulama başlıklarını göndermeyi sağlar
});

// Axios Request Interceptor: Her isteğe JWT token'ı ekler
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Hata durumlarını ve token süre bitimini yönetir
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token'ın süresi dolduysa veya yetkisiz erişim varsa kullanıcıyı giriş sayfasına yönlendir
    if (error.response && error.response.status === 401) {
      console.error('Yetkisiz erişim veya oturum süresi doldu:', error.response.data.message);
      localStorage.removeItem('token'); // Geçersiz token'ı kaldır
      // Yönlendirme için router'a erişimimiz olmadığı için burada doğrudan yönlendirme yapmıyoruz
      // Ancak Pinia store içinde bu durumu yakalayabiliriz.
      // Alternatif olarak, eğer bu kısımdan router'a erişmek isterseniz,
      // router'ı ayrı bir module olarak import edebilir veya Pinia store içinde yönetebilirsiniz.
    }
    return Promise.reject(error);
  }
);

export default apiClient;