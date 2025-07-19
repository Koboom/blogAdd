import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import AuthSuccessPage from '../views/AuthSuccessPage.vue';
import CreatePostPage from '../views/CreatePostPage.vue'; // Yeni yazı oluşturma da EditPostPage tarafından ele alınacak
import PostDetailPage from '../views/PostDetailPage.vue';
import EditPostPage from '../views/EditPostPage.vue'; // EditPostPage'i import ettik
import UserProfilePage from '../views/UserProfilePage.vue';
import NotFoundPage from '../views/NotFoundPage.vue';

import { useAuthStore } from '../stores/auth';
import { usePostStore } from '../stores/post'; // Post store'u import et

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
    // Yeni yazı oluşturma rotası (EditPostPage'i kullanır)
    path: '/create',
    name: 'CreatePost',
    component: EditPostPage, // CreatePostPage yerine EditPostPage kullanıyoruz
    meta: { requiresAuth: true },
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetailPage,
    props: true,
  },
  {
    // Yazı düzenleme rotası
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: EditPostPage,
    props: true,
    meta: { requiresAuth: true, requiresAuthorOrAdmin: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfilePage,
    meta: { requiresAuth: true },
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
router.beforeEach(async (to, from, next) => { // async ekledik, çünkü post detayını çekebiliriz
  const authStore = useAuthStore();
  const postStore = usePostStore(); // Post store'u da kullanacağız

  const isAuthenticated = authStore.isAuthenticated;
  const user = authStore.user;

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

  // Yazar veya Admin gerektiren rotalar için özel kontrol (EditPost rotası için)
  if (to.meta.requiresAuthorOrAdmin) {
    if (!isAuthenticated) {
        next('/login'); // Giriş yapmamışsa logine
        return;
    }

    // Eğer rota bir yazıya özgü (örn: /posts/:id/edit) ise
    if (to.params.id) {
        await postStore.fetchPostById(to.params.id); // Yazıyı çek
        const post = postStore.selectedPost;

        if (!post) {
            // Yazı bulunamazsa veya hata olursa
            next('/not-found'); // Veya ana sayfaya
            return;
        }

        // Kullanıcının yazıyı düzenleme/silme yetkisi yoksa
        if (!(user?._id === post.user?._id || authStore.isAdmin)) {
            alert('Bu yazıyı düzenlemeye yetkiniz bulunmamaktadır.');
            next('/'); // Yetkisiz ise ana sayfaya
            return;
        }
    }
  }

  next(); // Her şey yolundaysa devam et
});

export default router;