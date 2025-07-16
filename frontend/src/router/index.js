import { createRouter, createWebHistory } from 'vue-router';

// Gelecekte oluşturacağımız bileşenler için şimdilik yer tutucular
import HomePage from '../views/HomePage.vue'; // Bu dosyayı sonra oluşturacağız
import LoginPage from '../views/LoginPage.vue'; // Bu dosyayı sonra oluşturacağız
import RegisterPage from '../views/RegisterPage.vue'; // Bu dosyayı sonra oluşturacağız
import AuthSuccessPage from '../views/AuthSuccessPage.vue'; // Bu dosyayı sonra oluşturacağız
import PostDetailPage from '../views/PostDetailPage.vue'; // Bu dosyayı sonra oluşturacağız
import UserProfilePage from '../views/UserProfilePage.vue'; // Bu dosyayı sonra oluşturacağız
import NotFoundPage from '../views/NotFoundPage.vue'; // Bu dosyayı sonra oluşturacağız

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: AuthSuccessPage
  },
  {
    path: '/posts/:slug', // Dinamik rota, slug ile gönderi detayına git
    name: 'PostDetail',
    component: PostDetailPage
  },
  {
    path: '/profile', // Kullanıcı profili sayfası
    name: 'Profile',
    component: UserProfilePage,
    meta: { requiresAuth: true } // Bu rota için kimlik doğrulama gereksinimi ekleyeceğiz
  },
  // Tanımlanmayan tüm rotalar için yakalama
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Kimlik doğrulama kontrolü (meta.requiresAuth olan rotalar için)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Token'ı localStorage'dan alacağız

  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    // Bu rota kimlik doğrulama gerektiriyor ve token yoksa giriş sayfasına yönlendir
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    // Eğer zaten giriş yapmışsa ve tekrar giriş/kayıt sayfalarına gitmeye çalışırsa ana sayfaya yönlendir
    next({ name: 'Home' });
  } else {
    next(); // Her şey yolundaysa devam et
  }
});

export default router;