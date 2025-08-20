import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/infrastructure/router/index';
import { useUserStore } from '@/infrastructure/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Minimal global guard:
// - If a route has meta.requiresAuth and there's no user in the store,
//   redirect to /login and preserve the intended path as ?redirect=...
router.beforeEach((to) => {
  const auth = useUserStore();
  if (!auth.user) {
    auth.hydrateFromCookies?.();
  }

  if (to.meta?.requiresAuth && !auth.user) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  return true;
});

export default router;
