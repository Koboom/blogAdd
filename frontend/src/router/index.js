import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import AuthSuccessPage from '../views/AuthSuccessPage.vue';
import PostDetailPage from '../views/PostDetailPage.vue';
import UserProfilePage from '../views/UserProfilePage.vue'; // Henüz oluşturulmadıysa bile yer tutucu
import NotFoundPage from '../views/NotFoundPage.vue'; // Henüz oluşturulmadıysa bile yer tutucu
import CreatePostPage from '../views/CreatePostPage.vue'; // <-- Bu satırı ekleyin/doğrulayın
import { useAuthStore } from '../stores/auth'; // <-- Bu satırı ekleyin/doğrulayın (Pinia auth store'u)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true } // Sadece oturum açmamış kullanıcılar erişebilir
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true } // Sadece oturum açmamış kullanıcılar erişebilir
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: AuthSuccessPage
  },
  {
    path: '/create', // <-- Yeni yazı oluşturma rotası
    name: 'CreatePost',
    component: CreatePostPage,
    meta: { requiresAuth: true } // Bu rota için kimlik doğrulama gereksinimi
  },
  {
    path: '/posts/:id', // <-- BURAYI DÜZELTİN: ":slug" yerine ":id" ve props: true ekleyin
    name: 'PostDetail',
    component: PostDetailPage,
    props: true // URL parametresini (id) bileşene prop olarak geçir
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfilePage,
    meta: { requiresAuth: true }
  },
  // Blog yazısı düzenleme rotası (henüz EditPostPage'i oluşturmadık ama rotası hazır olsun)
  {
    path: '/posts/:id/edit', // Yeni rota: Blog yazısı düzenleme
    name: 'EditPost',
    component: () => import('../views/EditPostPage.vue'), // Lazy yükleme, dosyayı sonra oluşturacağız
    meta: { requiresAuth: true, requiresAuthorOrAdmin: true } // Yetki kontrolü ekleyeceğiz
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
  const authStore = useAuthStore(); // <-- Bu satırı ekleyin
  const isAuthenticated = authStore.isAuthenticated; // <-- Burayı değiştirin

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;