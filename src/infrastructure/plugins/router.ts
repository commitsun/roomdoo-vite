import { createRouter, createWebHistory, type Router, type RouterHistory } from 'vue-router';
import routes from '@/infrastructure/router/index';
import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

/** Attach global guards so both prod and tests share the exact logic */
export function attachGlobalGuards(router: Router): Router {
  router.beforeEach(async (to) => {
    const auth = useUserStore();

    // allow login unconditionally
    if (to.name === 'login') return true;

    // validate pmsPropertyId (fetch if needed)
    if (to.params.pmsPropertyId) {
      const pmsPropertiesStore = usePmsPropertiesStore();
      if (pmsPropertiesStore.pmsProperties.length === 0) {
        await pmsPropertiesStore.fetchPmsProperties();
      }
      const id = Number(to.params.pmsPropertyId);
      const exists = pmsPropertiesStore.pmsProperties.find((p) => p.id === id);
      if (!exists) return { name: '404-not-found' };
    }

    // lazy hydrate user from cookies if missing
    if (!auth.user) {
      auth.hydrateFromCookies?.();
    }

    // enforce auth when required
    if (to.meta?.requiresAuth && !auth.user) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    return true;
  });

  return router;
}

//Factory: used by tests to inject memory history (and, optional, test routes)
export function makeRouter(history: RouterHistory, customRoutes = routes): Router {
  const router = createRouter({
    history,
    routes: customRoutes,
  });
  return attachGlobalGuards(router);
}

// App export
const router = makeRouter(createWebHistory(import.meta.env.BASE_URL), routes);
export default router;
