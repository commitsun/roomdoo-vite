import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { createMemoryHistory, type Router } from 'vue-router';

import { makeRouter } from '@/infrastructure/plugins/router';
import { useUserStore } from '@/infrastructure/stores/user';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

const testRoutes = [
  { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
  {
    path: '/',
    name: 'home',
    component: { template: '<div>home</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/planning/:pmsPropertyId(\\d+)?',
    name: 'planning',
    component: { template: '<div>property</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/404-not-found',
    name: '404-not-found',
    component: { template: '<div>not found</div>' },
  },
];

let router: Router;

describe('router global beforeEach (with createTestingPinia)', () => {
  beforeEach(async () => {
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    });
    router = makeRouter(createMemoryHistory(), testRoutes);
  });

  it('redirects to /login with ?redirect when restricted access has not user set', async () => {
    await router.push('/planning');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/planning');
  });

  it('allows restricted route when user is set', async () => {
    vi.spyOn(useUserStore(), 'user', 'get').mockReturnValue({
      id: 1,
      email: 'a@b.c',
      languageId: 1,
      defaultPmsProperty: { id: 2, name: 'prop', image: '' },
      firstName: '',
      lastName: '',
    });
    await router.push('/');
    await router.isReady();
    expect(router.currentRoute.value.name).toBe('home');
  });

  it('dont allow invalid pmsPropertyId ', async () => {
    await router.push('/planning/999');
    await router.isReady();
    expect(router.currentRoute.value.name).toBe('404-not-found');
  });

  it('allow valid pmsPropertyId (with user set)', async () => {
    vi.spyOn(useUserStore(), 'user', 'get').mockReturnValue({
      id: 1,
      email: 'a@b.c',
      languageId: 1,
      defaultPmsProperty: { id: 2, name: 'prop', image: '' },
      firstName: '',
      lastName: '',
    });

    vi.spyOn(usePmsPropertiesStore(), 'pmsProperties', 'get').mockReturnValue([
      { id: 1, name: 'prop1', image: '' },
      { id: 2, name: 'prop2', image: '' },
    ]);

    await router.push('/planning/2');
    await router.isReady();
    expect(router.currentRoute.value.name).toBe('planning');
    expect(router.currentRoute.value.params.pmsPropertyId).toBe('2');
  });
});
