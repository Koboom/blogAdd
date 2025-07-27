// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import AuthSuccessPage from '../views/AuthSuccessPage.vue';
// import CreatePostPage from '../views/CreatePostPage.vue'; // Artık CreatePostPage'e gerek yok
import PostDetailPage from '../views/PostDetailPage.vue';
import CreatePostPage from '../views/CreatePostPage.vue';
import EditPostPage from '../views/EditPostPage.vue';
import UserProfilePage from '../views/UserProfilePage.vue'; // veya Profile.vue
import NotFoundPage from '../views/NotFoundPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

import { useAuthStore } from '../stores/auth';
import { usePostStore } from '../stores/post';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: AuthSuccessPage,
  },
  {
    path: '/create',
    name: 'CreatePost',
    component: CreatePostPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetailPage,
    props: true,
  },
  {
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: EditPostPage,
    props: true,
    meta: { requiresAuth: true, requiresAuthorOrAdmin: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfilePage, // Veya Profile.vue olarak değiştirin
    meta: { requiresAuth: true },
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Gezinme korumaları
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const postStore = usePostStore();

  const isAuthenticated = authStore.isAuthenticated;
  const user = authStore.user; // Pinia'dan gelen güncel user objesi

  // Giriş gerektiren sayfalar
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Giriş yapmış kullanıcıların erişemeyeceği sayfalar (Giriş/Kayıt)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
    return;
  }

  // Admin yetki kontrolü
  if (to.meta.requiresAdmin && (!isAuthenticated || !authStore.isAdmin)) {
    // console.log('Admin yetkisi yok, ana sayfaya yönlendiriliyor.'); // Debug için
    alert('Bu sayfaya erişim yetkiniz yok.');
    next('/');
    return;
  }

  // Yazar veya Admin gerektiren rotalar için özel kontrol (EditPost rotası için)
  if (to.meta.requiresAuthorOrAdmin) {
    // Bu kontrol zaten yukarıdaki `requiresAuth` tarafından yapıldı, ama emin olmak için bırakılabilir
    if (!isAuthenticated) {
        next('/login');
        return;
    }

    // Eğer rota bir yazıya özgü (örn: /posts/:id/edit) ise
    if (to.params.id) {
      // Yazıyı çekmeden önce, postStore'un `selectedPost` state'ini temizlemek faydalı olabilir
      // postStore.selectedPost = null; // Opsiyonel: her seferinde temiz bir başlangıç için
      await postStore.fetchPostById(to.params.id); // Yazıyı çek
      const post = postStore.currentPost; // Pinia'dan gelen güncel post objesi

      if (!post) {
        // Yazı bulunamazsa veya hata olursa
        alert('Düzenlemek istediğiniz yazı bulunamadı veya bir hata oluştu.'); // Kullanıcıya bilgi ver
        next('/not-found'); // Veya ana sayfaya
        return;
      }

      // Kullanıcının yazıyı düzenleme/silme yetkisi yoksa
      // authStore.user._id veya user._id kullanabiliriz. Pinia store daha günceldir.
      if (!(authStore.user?._id === post.author?._id || authStore.isAdmin)) {
        alert('Bu yazıyı düzenlemeye yetkiniz bulunmamaktadır.');
        next('/');
        return;
      }
    }
  }

  // Yukarıdaki koşullardan hiçbiri tetiklenmezse, gezinmeye devam et
  next();
});

export default router;